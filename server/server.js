import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'; // Import dotenv configuration for ES Modules

const app = express();

// Import error handling middleware
import { errorMiddleware } from './middleware/errorHandler.js';

// Middleware
app.use(express.json());
app.use(cors());

// Import Rate Limiting
import { apiLimiter, authLimiter, signupLimiter } from './middleware/rateLimiter.js';

// Import Routes
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/review.js';
import wishlistRoutes from './routes/wishlist.js';
import discountRoutes from './routes/discount.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js'; // Import new user routes

// Mount Routes with rate limiting
app.use('/api/products', apiLimiter, productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/discount', discountRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes); // Mount new user routes

// Apply specific rate limits to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', signupLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
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
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shaikhjee', {
      maxPoolSize: 10, // Connection pooling
      socketTimeoutMS: 45000,
    });
    console.log(`Shaikh Jee Vault connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Shaikh Jee Server running on port ${PORT}`));
});
