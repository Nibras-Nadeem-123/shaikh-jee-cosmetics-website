import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set environment variables for tests
  process.env.MONGO_URI = mongoUri;
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes';
  process.env.NODE_ENV = 'test';

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  // Create a test user
  createTestUser: async (User, overrides = {}) => {
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer',
      ...overrides
    };
    return await User.create(defaultUser);
  },

  // Create a test product
  createTestProduct: async (Product, overrides = {}) => {
    const defaultProduct = {
      name: 'Test Product',
      slug: 'test-product-' + Date.now(),
      price: 999,
      originalPrice: 1299,
      category: 'makeup',
      description: 'A test product',
      image: 'https://example.com/image.jpg',
      inStock: true,
      ...overrides
    };
    return await Product.create(defaultProduct);
  },

  // Generate auth token for testing
  generateTestToken: (userId) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
};
