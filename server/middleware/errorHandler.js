// Centralized error handling middleware
import { ERROR_CODES, createError } from '../utils/errorCodes.js';

export class ErrorHandler extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }

  // Static factory methods for common errors
  static badRequest(message = 'Bad request', errorCode = 'VAL_2001') {
    return new ErrorHandler(message, 400, errorCode);
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'AUTH_1004') {
    return new ErrorHandler(message, 401, errorCode);
  }

  static forbidden(message = 'Forbidden', errorCode = 'AUTH_1005') {
    return new ErrorHandler(message, 403, errorCode);
  }

  static notFound(message = 'Not found', errorCode = 'RES_3001') {
    return new ErrorHandler(message, 404, errorCode);
  }

  static conflict(message = 'Conflict', errorCode = 'RES_3007') {
    return new ErrorHandler(message, 409, errorCode);
  }

  static internal(message = 'Internal server error', errorCode = 'SRV_5001') {
    return new ErrorHandler(message, 500, errorCode);
  }

  // Create from error code
  static fromCode(errorType, customMessage = null) {
    const error = createError(errorType, customMessage);
    return new ErrorHandler(error.message, error.statusCode, error.code);
  }
}

// Middleware to handle async errors
export const catchAsyncErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handling middleware (should be last middleware)
export const errorMiddleware = (err, req, res) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Handle invalid MongoDB ID
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    err = new ErrorHandler(message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    err = new ErrorHandler(message, 400);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please login again';
    err = new ErrorHandler(message, 401);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    err = new ErrorHandler(message, 400);
  }

  // Build error response
  const errorResponse = {
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    ...(err.errorCode && { code: err.errorCode }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Check if it's an API route - always return JSON for API
  if (req.path.startsWith('/api/')) {
    return res.status(err.statusCode).json(errorResponse);
  }

  // For non-API routes, still return JSON (better for modern frontends)
  res.status(err.statusCode).json(errorResponse);
};
