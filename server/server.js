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

const app = express();

// Import error handling middleware
import { errorMiddleware } from './middleware/errorHandler.js';
// CSRF temporarily disabled for testing
// import { applyCSRF, handleCSRFError } from './middleware/csrf.js';

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
// CORS configuration for multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true
}));

// CSRF temporarily disabled
// Apply CSRF protection to all routes except GET and public endpoints
// app.use((req, res, next) => {
//   if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
//     return next();
//   }
//
//   const publicPaths = [
//     '/api/auth/login',
//     '/api/auth/signup',
//     '/api/auth/google',
//     '/api/payment/razorpay-webhook',
//     '/api/payment/webhook',
//     '/api/orders/new'
//   ];
//
//   if (publicPaths.some(path => req.path.startsWith(path))) {
//     return next();
//   }
//
//   applyCSRF(req, res, next);
// });

// CSRF error handler
// app.use(handleCSRFError);

// Apply global rate limiting middleware BEFORE routes
app.use(limiter);

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
// import analyticsRoutes from './routes/analytics.js'; // Temporarily disabled

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
});
