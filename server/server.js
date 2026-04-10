import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import { limiter, authLimiter, signupLimiter } from './middleware/rateLimiter.js';
import { connectRedis, isRedisConnected } from './config/redis.js';
import cookieParser from 'cookie-parser';

const app = express();

// Import error handling middleware
import { errorMiddleware } from './middleware/errorHandler.js';
// CSRF temporarily disabled for testing
// import { applyCSRF, handleCSRFError } from './middleware/csrf.js';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Apply specific rate limits to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', signupLimiter);

// Apply rate limiting middleware
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    redis: isRedisConnected(),
    mongodb: mongoose.connection.readyState === 1
  });
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
