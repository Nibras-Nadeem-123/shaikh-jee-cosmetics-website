// Centralized error handling middleware

export class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
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

  // Check if it's an API route - always return JSON for API
  if (req.path.startsWith('/api/')) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode
    });
  }

  // For non-API routes, still return JSON (better for modern frontends)
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode
  });
};
