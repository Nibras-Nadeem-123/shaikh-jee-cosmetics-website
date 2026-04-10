import csrf from 'csurf';
import { catchAsyncErrors, ErrorHandler } from './errorHandler.js';

// CSRF protection middleware
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' } });

// Apply CSRF protection to routes
export const applyCSRF = (req, res, next) => {
  csrfProtection(req, res, (err) => {
    if (err) {
      return next(new ErrorHandler('CSRF token missing or invalid', 403));
    }
    next();
  });
};

// Generate CSRF token
export const generateCSRFToken = catchAsyncErrors(async (req, res) => {
  if (!req.csrfToken) {
    return res.status(500).json({ success: false, message: 'CSRF not initialized' });
  }
  
  res.status(200).json({
    success: true,
    csrfToken: req.csrfToken()
  });
});

// CSRF error handler
export const handleCSRFError = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh the page and try again.'
    });
  }
  next(err);
};
