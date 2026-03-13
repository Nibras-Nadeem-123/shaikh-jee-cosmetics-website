import rateLimit from 'express-rate-limit';

// Rate limit configuration
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after a few minutes.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    // Skip rate limiting for successful requests
    skip: (req) => {
      // Skip rate limiting for health checks and static assets
      return (
        req.path === '/' ||
        req.path?.startsWith('/api/health') ||
        req.path?.startsWith('/public/')
      );
    },
    // Key generator for rate limiting (uses IP by default)
    keyGenerator: (req) => {
      // For authenticated users, rate limit by user ID instead of IP
      if (req.user && req.user._id) {
        return `user_${req.user._id}`;
      }
      // For anonymous users, rate limit by IP
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
  });
};

// Different rate limits for different routes
export const limiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 login attempts per 15 minutes
export const signupLimiter = createRateLimiter(60 * 60 * 1000, 3); // 3 signup attempts per hour
export const apiLimiter = createRateLimiter(1 * 60 * 1000, 200); // 200 API requests per minute

// Error handler for rate limit
export const rateLimitHandler = (req, res, next) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfter: res.getHeader('Retry-After')
  });
};
