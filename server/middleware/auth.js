import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ErrorHandler, catchAsyncErrors } from './errorHandler.js';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

/**
 * Middleware to authenticate user via JWT token
 */
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    throw new ErrorHandler('Login first to access this resource', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      throw new ErrorHandler('User not found', 404);
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ErrorHandler('Token expired. Please login again', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ErrorHandler('Invalid token. Please login again', 401);
    }
    throw new ErrorHandler('Authentication failed', 401);
  }
});

/**
 * Middleware to authorize specific roles
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'customer')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new ErrorHandler(
        `Access denied: Role '${req.user?.role || 'guest'}' is not authorized to access this resource`,
        403
      );
      return next(err);
    }
    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorizeRoles('admin');

/**
 * Middleware to check if user is customer
 */
export const isCustomer = authorizeRoles('customer');

/**
 * Middleware to allow admin or owner of the resource
 * @param {string} userIdField - Field name in request params/body that contains user ID
 */
export const isAdminOrOwner = (userIdField = 'userId') => {
  return catchAsyncErrors(async (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    const userId = req.params[userIdField] || req.body[userIdField];
    
    if (!userId || req.user._id.toString() !== userId) {
      throw new ErrorHandler('Access denied: You can only access your own resources', 403);
    }

    next();
  });
};

/**
 * Middleware to verify token without requiring user to be in database
 * Useful for checking token validity
 */
export const verifyTokenOnly = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    throw new ErrorHandler('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ErrorHandler('Token expired', 401);
    }
    throw new ErrorHandler('Invalid token', 401);
  }
});

// Function to set JWT as HTTP-only cookie
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * IP Whitelisting middleware for admin routes
 * Restricts admin access to specific IP addresses
 * Set ADMIN_WHITELIST_IPS in env as comma-separated values
 * If not set or empty, allows all IPs (for development)
 */
export const ipWhitelist = catchAsyncErrors(async (req, res, next) => {
  const whitelistStr = process.env.ADMIN_WHITELIST_IPS;

  // Skip IP check if whitelist is not configured (development mode)
  if (!whitelistStr || whitelistStr.trim() === '') {
    return next();
  }

  const whitelist = whitelistStr.split(',').map(ip => ip.trim());

  // Get client IP (handle proxies)
  const clientIP = req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress;

  // Normalize IPv6 localhost to IPv4
  const normalizedIP = clientIP === '::1' ? '127.0.0.1' : clientIP;

  // Check if IP is in whitelist
  const isAllowed = whitelist.some(ip => {
    // Support CIDR notation in future, for now exact match
    return normalizedIP === ip || normalizedIP?.includes(ip);
  });

  if (!isAllowed) {
    console.warn(`Admin access denied for IP: ${normalizedIP}`);
    throw new ErrorHandler('Access denied: Your IP is not authorized for admin access', 403);
  }

  next();
});

/**
 * Combined admin middleware: IP whitelist + authentication + admin role
 */
export const secureAdmin = [ipWhitelist, isAuthenticatedUser, isAdmin];

export { setTokenCookie };
