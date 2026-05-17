import crypto from 'crypto';

/**
 * Modern CSRF Protection using Double-Submit Cookie Pattern
 *
 * How it works:
 * 1. Server generates a random token and sends it as a cookie
 * 2. Client must send the same token in the X-CSRF-Token header
 * 3. Server validates that cookie value matches header value
 *
 * This is secure because:
 * - Attackers cannot read cookies from other domains (Same-Origin Policy)
 * - Attackers cannot set custom headers in cross-origin requests
 */

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

// Generate a cryptographically secure random token
const generateToken = () => {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
};

// Cookie options
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: false, // Must be readable by JavaScript
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-origin in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    // Note: domain is NOT set, allowing cookie to work across subdomains
  };
};

/**
 * Middleware to set CSRF token cookie on every request
 */
export const setCSRFToken = (req, res, next) => {
  // Check if token already exists in cookie
  let token = req.cookies[CSRF_COOKIE_NAME];

  // Generate new token if not exists
  if (!token) {
    token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, getCookieOptions());
  }

  // Attach token to request for use in routes
  req.csrfToken = () => token;

  next();
};

/**
 * Middleware to validate CSRF token
 * Skips validation for safe methods (GET, HEAD, OPTIONS)
 */
export const validateCSRFToken = (req, res, next) => {
  // Skip validation for safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.headers['csrf-token'];

  // Check if both tokens exist
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing. Please refresh the page and try again.',
      code: 'CSRF_MISSING'
    });
  }

  // Validate tokens match using timing-safe comparison
  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (cookieBuffer.length !== headerBuffer.length ||
      !crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh the page and try again.',
      code: 'CSRF_INVALID'
    });
  }

  next();
};

/**
 * List of paths that should skip CSRF validation
 * These are typically webhook endpoints or public APIs
 */
const CSRF_EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/payment/razorpay-webhook',
  '/api/payment/webhook',
  '/api/payment/mock-payment',
  '/api/payment/mock-confirm',
  '/api/newsletter/subscribe',
  '/api/stock-alerts/subscribe',
  '/api/contact'
];

/**
 * Check if path should be exempt from CSRF protection
 */
const isExemptPath = (path) => {
  return CSRF_EXEMPT_PATHS.some(exemptPath =>
    path === exemptPath || path.startsWith(exemptPath + '/')
  );
};

/**
 * Combined CSRF middleware with exemption support
 */
export const csrfProtection = (req, res, next) => {
  // Always set the CSRF token cookie
  setCSRFToken(req, res, () => {
    // Skip validation for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip validation for exempt paths
    if (isExemptPath(req.path)) {
      return next();
    }

    // Validate CSRF token
    validateCSRFToken(req, res, next);
  });
};

/**
 * Route handler to get CSRF token
 * Frontend can call this to get a fresh token
 */
export const getCSRFToken = (req, res) => {
  // Generate new token
  const token = generateToken();
  res.cookie(CSRF_COOKIE_NAME, token, getCookieOptions());

  res.json({
    success: true,
    csrfToken: token
  });
};

/**
 * Error handler for CSRF errors
 */
export const handleCSRFError = (err, req, res, next) => {
  if (err.code === 'CSRF_MISSING' || err.code === 'CSRF_INVALID') {
    return res.status(403).json({
      success: false,
      message: err.message || 'CSRF validation failed',
      code: err.code
    });
  }
  next(err);
};

export default {
  setCSRFToken,
  validateCSRFToken,
  csrfProtection,
  getCSRFToken,
  handleCSRFError
};
