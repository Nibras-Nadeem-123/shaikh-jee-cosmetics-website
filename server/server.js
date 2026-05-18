import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';
import { limiter, authLimiter, signupLimiter } from './middleware/rateLimiter.js';
import { connectRedis, isRedisConnected } from './config/redis.js';
import cookieParser from 'cookie-parser';
import logger, { requestLogger } from './utils/logger.js';
import swaggerSpec from './config/swagger.js';
import { initSentry, sentryErrorHandler, isSentryEnabled } from './config/sentry.js';
import { processAbandonedCarts } from './utils/abandonedCartService.js';
import { checkAllProductsLowStock } from './utils/lowStockService.js';

const app = express();

// Initialize Sentry (must be done early, before other middleware)
initSentry(app);

// Import error handling middleware
import { errorMiddleware } from './middleware/errorHandler.js';
// Selective CSRF Protection (only for non-API routes)
import { selectiveCSRFProtection, getCSRFToken } from './middleware/csrf.js';

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// Performance Middleware
app.use(compression()); // Compress response bodies

// Logging Middleware
app.use(requestLogger);

// Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://shaikhjee.com',
  'https://www.shaikhjee.com',
  'https://shaikh-jee-cosmetics-website.vercel.app',
  // Allow all Vercel preview deployments
  /^https:\/\/shaikh-jee-cosmetics-website.*\.vercel\.app$/,
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production, check against allowed origins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    // Log rejected origins for debugging
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'csrf-token',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Content-Disposition',
    'Content-Length',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400, // 24 hours - cache preflight requests
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));

// Selective CSRF Protection
// API routes are protected by JWT (Authorization header)
// Form submissions still use CSRF tokens
app.use(selectiveCSRFProtection);

// Route to get CSRF token (for form submissions)
app.get('/api/csrf-token', getCSRFToken);

// Debug endpoint removed - CSRF not needed for JWT-based API

// Apply global rate limiting middleware BEFORE routes
app.use(limiter);

// API usage tracking (for rate limit dashboard)
app.use(apiTracker);

// Import Routes
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import authRoutes from './routes/auth.js';
// import authExtraRoutes from './routes/auth-extra.js'; // Temporarily disabled
import oauthRoutes from './routes/oauth.js';
import reviewRoutes from './routes/review.js';
import wishlistRoutes from './routes/wishlist.js';
import discountRoutes from './routes/discount.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import loyaltyRoutes from './routes/loyalty.js';
import newsletterRoutes from './routes/newsletter.js';
import cartRoutes from './routes/cart.js';
import stockAlertRoutes from './routes/stockAlert.js';
import backupRoutes from './routes/backup.js';
import cacheRoutes from './routes/cache.js';
import imageRoutes from './routes/image.js';
import referralRoutes from './routes/referral.js';
import rateLimitDashboardRoutes from './routes/rateLimitDashboard.js';
import contactRoutes from './routes/contact.js';
// import analyticsRoutes from './routes/analytics.js'; // Temporarily disabled

// API Usage Tracking
import { apiTracker } from './middleware/apiTracker.js';

// Apply specific rate limits to auth routes BEFORE mounting routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', signupLimiter);

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
// app.use('/api/auth', authExtraRoutes); // Temporarily disabled
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/discount', discountRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/stock-alerts', stockAlertRoutes);
app.use('/api/admin/backups', backupRoutes);
app.use('/api/admin/cache', cacheRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/admin/rate-limits', rateLimitDashboardRoutes);
app.use('/api/contact', contactRoutes);
// app.use('/api/analytics', analyticsRoutes); // Temporarily disabled

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Shaikh Jee API Docs'
}));

// Swagger JSON spec endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint (basic)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    redis: isRedisConnected(),
    mongodb: mongoose.connection.readyState === 1
  });
});

// Detailed health check endpoint
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      mongodb: {
        status: 'unknown',
        latency: null
      },
      redis: {
        status: 'unknown',
        latency: null
      }
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };

  // Check MongoDB
  try {
    const mongoStart = Date.now();
    await mongoose.connection.db.admin().ping();
    healthCheck.services.mongodb = {
      status: 'healthy',
      latency: Date.now() - mongoStart
    };
  } catch (error) {
    healthCheck.services.mongodb = {
      status: 'unhealthy',
      error: error.message
    };
    healthCheck.success = false;
  }

  // Check Redis
  try {
    if (isRedisConnected()) {
      const redisStart = Date.now();
      const { getRedisClient } = await import('./config/redis.js');
      await getRedisClient().ping();
      healthCheck.services.redis = {
        status: 'healthy',
        latency: Date.now() - redisStart
      };
    } else {
      healthCheck.services.redis = {
        status: 'disconnected',
        message: 'Redis not connected (optional service)'
      };
    }
  } catch (error) {
    healthCheck.services.redis = {
      status: 'unhealthy',
      error: error.message
    };
  }

  const statusCode = healthCheck.success ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Base route
app.get('/', (req, res) => {
  res.send('Shaikh Jee API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Sentry error handler (must be before other error handlers)
if (isSentryEnabled()) {
  app.use(sentryErrorHandler());
}

// Error handling middleware (MUST be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
}).then(() => {
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
}).catch(error => {
  console.error(`❌ MongoDB connection error: ${error.message}`);
});

// Connect Redis in background
connectRedis();

// Start server
app.listen(PORT, () => {
  console.log(`✅ Shaikh Jee Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

  // Start abandoned cart email scheduler (runs every 30 minutes)
  const ABANDONED_CART_INTERVAL = 30 * 60 * 1000; // 30 minutes
  setInterval(async () => {
    try {
      console.log('[Scheduler] Running abandoned cart processor...');
      const results = await processAbandonedCarts();
      if (results.emailsSent > 0) {
        console.log(`[Scheduler] Abandoned cart emails sent: ${results.emailsSent}`);
      }
    } catch (error) {
      console.error('[Scheduler] Abandoned cart processor error:', error.message);
    }
  }, ABANDONED_CART_INTERVAL);

  // Run once on startup (after 1 minute delay to allow DB connection)
  setTimeout(async () => {
    try {
      console.log('[Scheduler] Initial abandoned cart check...');
      await processAbandonedCarts();
    } catch (error) {
      console.error('[Scheduler] Initial abandoned cart check error:', error.message);
    }
  }, 60 * 1000);

  console.log(`✅ Abandoned cart scheduler started (every 30 minutes)`);

  // Start low stock alert scheduler (runs every 6 hours)
  const LOW_STOCK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
  setInterval(async () => {
    try {
      console.log('[Scheduler] Running low stock check...');
      const results = await checkAllProductsLowStock();
      if (results.notificationSent) {
        console.log(`[Scheduler] Low stock alert sent: ${results.lowStockCount} products low, ${results.criticalCount} critical`);
      }
    } catch (error) {
      console.error('[Scheduler] Low stock check error:', error.message);
    }
  }, LOW_STOCK_INTERVAL);

  // Run initial low stock check (after 2 minutes to allow DB connection)
  setTimeout(async () => {
    try {
      console.log('[Scheduler] Initial low stock check...');
      const results = await checkAllProductsLowStock();
      if (results.lowStockCount > 0) {
        console.log(`[Scheduler] Found ${results.lowStockCount} low stock products`);
      }
    } catch (error) {
      console.error('[Scheduler] Initial low stock check error:', error.message);
    }
  }, 2 * 60 * 1000);

  console.log(`✅ Low stock alert scheduler started (every 6 hours)`);
});
