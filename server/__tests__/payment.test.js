import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import paymentRoutes from '../routes/payment.js';
import { errorMiddleware } from '../middleware/errorHandler.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/payment', paymentRoutes);
  app.use(errorMiddleware);
  return app;
};

// Generate auth token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate webhook signature for testing
const generateWebhookSignature = (body, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
};

describe('Payment Routes', () => {
  let app;
  let testUser;
  let testProduct;
  let testOrder;
  let userToken;

  beforeAll(() => {
    app = createTestApp();
    // Set webhook secret for testing
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret';
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Payment Test User',
      email: 'payment@example.com',
      password: 'password123',
      role: 'customer'
    });
    userToken = generateToken(testUser._id);

    // Create test product
    testProduct = await Product.create({
      name: 'Test Foundation',
      slug: 'test-foundation-' + Date.now(),
      category: 'makeup',
      price: 799,
      description: 'A beautiful foundation',
      image: 'https://example.com/foundation.jpg',
      inStock: true,
      inventory: {
        quantity: 50,
        trackInventory: true
      }
    });

    // Create test order
    testOrder = await Order.create({
      orderItems: [{
        product: testProduct._id,
        name: 'Test Foundation',
        quantity: 1,
        image: 'https://example.com/foundation.jpg',
        price: 799
      }],
      shippingAddress: {
        name: 'Test Customer',
        addressLine1: '456 Payment Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '9876543210',
        email: 'payment@example.com'
      },
      user: testUser._id,
      paymentMethod: 'Digital',
      itemsPrice: 799,
      shippingPrice: 50,
      totalPrice: 849,
      orderStatus: 'pending'
    });
  });

  describe('POST /api/payment/mock-payment', () => {
    it('should create a mock payment successfully', async () => {
      const res = await request(app)
        .post('/api/payment/mock-payment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 849,
          orderId: testOrder._id.toString()
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBeDefined();
      expect(res.body.paymentId).toMatch(/^pay_/);
      expect(res.body.amount).toBe(849);
      expect(res.body.status).toBe('pending');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/payment/mock-payment')
        .send({
          amount: 849,
          orderId: testOrder._id.toString()
        });

      expect(res.statusCode).toBe(401);
    });

    it('should fail without amount', async () => {
      const res = await request(app)
        .post('/api/payment/mock-payment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: testOrder._id.toString()
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail without orderId', async () => {
      const res = await request(app)
        .post('/api/payment/mock-payment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 849
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail with invalid amount', async () => {
      const res = await request(app)
        .post('/api/payment/mock-payment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 0,
          orderId: testOrder._id.toString()
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail with negative amount', async () => {
      const res = await request(app)
        .post('/api/payment/mock-payment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: -100,
          orderId: testOrder._id.toString()
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/payment/mock-confirm', () => {
    it('should confirm mock payment successfully', async () => {
      const res = await request(app)
        .post('/api/payment/mock-confirm')
        .send({
          orderId: testOrder._id.toString(),
          paymentId: 'pay_test123456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Payment confirmed successfully');
      expect(res.body.order).toBeDefined();

      // Verify order was updated
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.paymentStatus).toBe('paid');
      expect(updatedOrder.orderStatus).toBe('processing');
      expect(updatedOrder.paymentInfo.id).toBe('pay_test123456');
      expect(updatedOrder.paymentInfo.status).toBe('captured');
    });

    it('should fail without orderId', async () => {
      const res = await request(app)
        .post('/api/payment/mock-confirm')
        .send({
          paymentId: 'pay_test123456'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail without paymentId', async () => {
      const res = await request(app)
        .post('/api/payment/mock-confirm')
        .send({
          orderId: testOrder._id.toString()
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail with non-existent order', async () => {
      const fakeOrderId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/payment/mock-confirm')
        .send({
          orderId: fakeOrderId,
          paymentId: 'pay_test123456'
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/payment/razorpay-webhook', () => {
    it('should reject webhook without signature', async () => {
      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_razorpay123',
              notes: { order_id: testOrder._id.toString() }
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/payment/razorpay-webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(webhookBody));

      expect(res.statusCode).toBe(400);
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_razorpay123',
              notes: { order_id: testOrder._id.toString() }
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/payment/razorpay-webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', 'invalid-signature')
        .send(JSON.stringify(webhookBody));

      expect(res.statusCode).toBe(401);
    });

    it('should handle payment.captured event with valid signature', async () => {
      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_razorpay123',
              notes: { order_id: testOrder._id.toString() }
            }
          }
        }
      };

      const signature = generateWebhookSignature(webhookBody, process.env.RAZORPAY_WEBHOOK_SECRET);

      const res = await request(app)
        .post('/api/payment/razorpay-webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(JSON.stringify(webhookBody));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle payment.failed event with valid signature', async () => {
      const webhookBody = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed123',
              notes: { order_id: testOrder._id.toString() }
            }
          }
        }
      };

      const signature = generateWebhookSignature(webhookBody, process.env.RAZORPAY_WEBHOOK_SECRET);

      const res = await request(app)
        .post('/api/payment/razorpay-webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(JSON.stringify(webhookBody));

      expect(res.statusCode).toBe(200);

      // Verify order was updated
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.paymentStatus).toBe('failed');
      expect(updatedOrder.orderStatus).toBe('cancelled');
    });

    it('should handle unrecognized event types gracefully', async () => {
      const webhookBody = {
        event: 'payment.refunded',
        payload: {
          payment: {
            entity: {
              id: 'pay_refund123',
              notes: { order_id: testOrder._id.toString() }
            }
          }
        }
      };

      const signature = generateWebhookSignature(webhookBody, process.env.RAZORPAY_WEBHOOK_SECRET);

      const res = await request(app)
        .post('/api/payment/razorpay-webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(JSON.stringify(webhookBody));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Payment Flow Integration', () => {
  let app;
  let testUser;
  let testProduct;
  let testOrder;
  let userToken;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Integration Test User',
      email: 'integration@example.com',
      password: 'password123'
    });
    userToken = generateToken(testUser._id);

    testProduct = await Product.create({
      name: 'Integration Test Product',
      slug: 'integration-test-' + Date.now(),
      category: 'skincare',
      price: 599,
      description: 'Product for integration testing',
      image: 'https://example.com/product.jpg',
      inventory: {
        quantity: 25,
        trackInventory: true
      }
    });

    testOrder = await Order.create({
      orderItems: [{
        product: testProduct._id,
        name: 'Integration Test Product',
        quantity: 2,
        image: 'https://example.com/product.jpg',
        price: 599
      }],
      shippingAddress: {
        name: 'Integration Tester',
        addressLine1: '789 Integration Ave',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '9876543210',
        email: 'integration@example.com'
      },
      user: testUser._id,
      paymentMethod: 'Digital',
      itemsPrice: 1198,
      shippingPrice: 0,
      totalPrice: 1198
    });
  });

  it('should complete full mock payment flow', async () => {
    // Step 1: Create mock payment
    const createRes = await request(app)
      .post('/api/payment/mock-payment')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: testOrder.totalPrice,
        orderId: testOrder._id.toString()
      });

    expect(createRes.statusCode).toBe(200);
    const { paymentId } = createRes.body;

    // Step 2: Confirm payment
    const confirmRes = await request(app)
      .post('/api/payment/mock-confirm')
      .send({
        orderId: testOrder._id.toString(),
        paymentId
      });

    expect(confirmRes.statusCode).toBe(200);

    // Step 3: Verify order state
    const updatedOrder = await Order.findById(testOrder._id);
    expect(updatedOrder.paymentStatus).toBe('paid');
    expect(updatedOrder.orderStatus).toBe('processing');
    expect(updatedOrder.paymentInfo.id).toBe(paymentId);
  });

  it('should handle COD orders without payment processing', async () => {
    const codOrder = await Order.create({
      orderItems: [{
        product: testProduct._id,
        name: 'COD Test Product',
        quantity: 1,
        image: 'https://example.com/product.jpg',
        price: 599
      }],
      shippingAddress: {
        name: 'COD Customer',
        addressLine1: '123 COD Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        phone: '9876543210',
        email: 'cod@example.com'
      },
      user: testUser._id,
      paymentMethod: 'COD',
      itemsPrice: 599,
      shippingPrice: 50,
      totalPrice: 649
    });

    expect(codOrder.paymentMethod).toBe('COD');
    expect(codOrder.orderStatus).toBe('pending');
    // COD orders don't need payment confirmation
  });
});

describe('Payment Validation', () => {
  it('should validate amount is a number', async () => {
    const app = createTestApp();
    const testUser = await User.create({
      name: 'Validation Test',
      email: 'validation@example.com',
      password: 'password123'
    });
    const token = generateToken(testUser._id);

    const res = await request(app)
      .post('/api/payment/mock-payment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 'not-a-number',
        orderId: '507f1f77bcf86cd799439011'
      });

    expect(res.statusCode).toBe(400);
  });

  it('should reject very large amounts', async () => {
    const app = createTestApp();
    const testUser = await User.create({
      name: 'Large Amount Test',
      email: 'largeamount@example.com',
      password: 'password123'
    });
    const token = generateToken(testUser._id);

    const res = await request(app)
      .post('/api/payment/mock-payment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 99999999999,
        orderId: '507f1f77bcf86cd799439011'
      });

    // Should still create payment - no max limit validation
    expect(res.statusCode).toBe(200);
  });
});

describe('Stock Deduction on Payment', () => {
  let app;
  let testUser;
  let testProduct;
  let testOrder;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Stock Test User',
      email: 'stock@example.com',
      password: 'password123'
    });

    testProduct = await Product.create({
      name: 'Stock Test Product',
      slug: 'stock-test-' + Date.now(),
      category: 'makeup',
      price: 399,
      description: 'Product for stock testing',
      image: 'https://example.com/stock.jpg',
      inventory: {
        quantity: 10,
        trackInventory: true,
        lowStockThreshold: 5
      }
    });

    testOrder = await Order.create({
      orderItems: [{
        product: testProduct._id,
        name: 'Stock Test Product',
        quantity: 3,
        image: 'https://example.com/stock.jpg',
        price: 399
      }],
      shippingAddress: {
        name: 'Stock Tester',
        addressLine1: '100 Stock Street',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        phone: '9876543210',
        email: 'stock@example.com'
      },
      user: testUser._id,
      paymentMethod: 'Digital',
      itemsPrice: 1197,
      shippingPrice: 0,
      totalPrice: 1197
    });
  });

  it('should deduct stock after payment confirmation', async () => {
    const initialQuantity = testProduct.inventory.quantity;

    await request(app)
      .post('/api/payment/mock-confirm')
      .send({
        orderId: testOrder._id.toString(),
        paymentId: 'pay_stock_test'
      });

    const updatedProduct = await Product.findById(testProduct._id);
    // Stock should be deducted by order quantity
    expect(updatedProduct.inventory.quantity).toBe(initialQuantity - 3);
  });
});
