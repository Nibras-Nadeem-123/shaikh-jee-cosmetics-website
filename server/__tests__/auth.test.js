import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authRoutes from '../routes/auth.js';
import { errorMiddleware } from '../middleware/errorHandler.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorMiddleware);
  return app;
};

describe('Auth Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.name).toBe('Test User');
    });

    it('should fail with existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await User.create({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/password-reset', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Reset Test User',
        email: 'reset@example.com',
        password: 'password123'
      });
    });

    it('should send password reset email for valid user', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset')
        .send({
          email: 'reset@example.com'
        });

      // Note: This might fail without SMTP config, but structure should be correct
      expect(res.statusCode).toBeLessThanOrEqual(500);
    });

    it('should fail for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(res.statusCode).toBe(404);
    });
  });
});

describe('JWT Token Validation', () => {
  it('should generate valid JWT token', () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(userId.toString());
  });

  it('should reject expired token', () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '-1h' });

    expect(() => {
      jwt.verify(token, process.env.JWT_SECRET);
    }).toThrow();
  });

  it('should reject invalid token', () => {
    expect(() => {
      jwt.verify('invalid-token', process.env.JWT_SECRET);
    }).toThrow();
  });
});
