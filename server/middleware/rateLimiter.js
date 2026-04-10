import rateLimit from 'express-rate-limit';

// Store for IP-based rate limiting
const ipStore = new Map();

// Rate limit configuration
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, name = 'default') => {
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
    // Skip rate limiting for health checks and static assets
    skip: (req) => {
      return (
        req.path === '/' ||
        req.path?.startsWith('/api/health') ||
        req.path?.startsWith('/public/') ||
        req.path?.startsWith('/static/')
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
    // Custom handler when limit is exceeded
    handler: (req, res, next, options) => {
      console.warn(`Rate limit exceeded for ${name}:`, {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userId: req.user?._id || 'anonymous'
      });
      
      res.status(429).json({
        success: false,
        message: options.message.message,
        retryAfter: Math.ceil(options.windowMs / 1000),
        limit: options.max,
        window: options.windowMs
      });
    },
    // Store for rate limiting (in-memory for now, can use Redis in production)
    store: {
      hits: new Map(),
      incr: function(key, cb) {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!this.hits.has(key)) {
          this.hits.set(key, { hits: 1, windowStart });
        } else {
          const record = this.hits.get(key);
          if (record.windowStart < windowStart) {
            record.hits = 1;
            record.windowStart = now;
          } else {
            record.hits++;
          }
        }
        
        cb(null, {
          totalHits: this.hits.get(key).hits,
          resetTime: this.hits.get(key).windowStart + windowMs
        });
      },
      decrement: function(key) {
        if (this.hits.has(key)) {
          const record = this.hits.get(key);
          record.hits = Math.max(0, record.hits - 1);
        }
      },
      resetAll: function() {
        this.hits.clear();
      }
    }
  });
};

// Different rate limits for different routes
// Global limiter - applied to all routes
export const limiter = createRateLimiter(15 * 60 * 1000, 100, 'global');

// Auth endpoints - strict limits
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'auth-login'); // 5 login attempts per 15 minutes
export const signupLimiter = createRateLimiter(60 * 60 * 1000, 3, 'auth-signup'); // 3 signup attempts per hour
export const passwordResetLimiter = createRateLimiter(60 * 60 * 1000, 3, 'auth-password-reset'); // 3 password reset per hour

// API endpoints - higher limits
export const apiLimiter = createRateLimiter(1 * 60 * 1000, 200, 'api'); // 200 API requests per minute

// Search endpoints - moderate limits (expensive operations)
export const searchLimiter = createRateLimiter(1 * 60 * 1000, 30, 'search'); // 30 searches per minute

// Order/Payment endpoints - strict limits
export const orderLimiter = createRateLimiter(1 * 60 * 1000, 10, 'order'); // 10 orders per minute
export const paymentLimiter = createRateLimiter(1 * 60 * 1000, 5, 'payment'); // 5 payment attempts per minute

// Review endpoints - moderate limits
export const reviewLimiter = createRateLimiter(1 * 60 * 1000, 10, 'review'); // 10 reviews per minute

// Admin endpoints - strict limits
export const adminLimiter = createRateLimiter(1 * 60 * 1000, 50, 'admin'); // 50 admin actions per minute

// Error handler for rate limit
export const rateLimitHandler = (req, res, next) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfter: res.getHeader('Retry-After')
  });
};

// Middleware to apply multiple rate limiters
export const applyRateLimiters = (...limiters) => {
  return (req, res, next) => {
    const limiter = limiters[0];
    if (!limiter) return next();
    
    limiter(req, res, (err) => {
      if (err) return next(err);
      
      // Apply remaining limiters
      const remaining = limiters.slice(1);
      if (remaining.length > 0) {
        applyRateLimiters(...remaining)(req, res, next);
      } else {
        next();
      }
    });
  };
};

// IP-based rate limiting (for DDoS protection)
export const ipLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute per IP
  message: {
    success: false,
    message: 'Too many requests from your IP. Please slow down.'
  },
  keyGenerator: (req) => req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false
});
