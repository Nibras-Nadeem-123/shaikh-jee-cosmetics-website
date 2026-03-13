import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ErrorHandler, catchAsyncErrors } from './errorHandler.js';

// Authenticated user check
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
      throw new ErrorHandler('Token expired', 401);
    }
    throw new ErrorHandler('Invalid or expired token', 401);
  }
});

// Role based access control
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new ErrorHandler(
        `Role (${req.user.role}) is not allowed to access this resource`,
        403
      );
      return next(err);
    }
    next();
  };
};
