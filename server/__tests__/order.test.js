import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import orderRoutes from '../routes/order.js';
import { errorMiddleware } from '../middleware/errorHandler.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', orderRoutes);
  app.use(errorMiddleware);
  return app;
};

// Generate auth token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Order Routes', () => {
  let app;
  let testUser;
  let testProduct;
  let userToken;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Order Test User',
      email: 'ordertest@example.com',
      password: 'password123',
      role: 'customer'
    });
    userToken = generateToken(testUser._id);

    // Create test product
    testProduct = await Product.create({
      name: 'Test Lipstick',
      slug: 'test-lipstick-' + Date.now(),
      price: 599,
      originalPrice: 799,
      category: 'lips',
      description: 'A test lipstick product',
      image: 'https://example.com/lipstick.jpg',
      inStock: true,
      stock: 100
    });
  });

  describe('POST /api/orders/new', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        orderItems: [{
          product: testProduct._id,
          name: testProduct.name,
          quantity: 2,
          image: testProduct.image,
          price: testProduct.price
        }],
        shippingAddress: {
          name: 'Test Customer',
          addressLine1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: 'customer@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 1198,
        shippingPrice: 50,
        totalPrice: 1248
      };

      const res = await request(app)
        .post('/api/orders/new')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.orderItems).toHaveLength(1);
      expect(res.body.order.totalPrice).toBe(1248);
      expect(res.body.order.paymentMethod).toBe('COD');
      expect(res.body.order.orderStatus).toBe('pending');
    });

    it('should create order with digital payment method', async () => {
      const orderData = {
        orderItems: [{
          product: testProduct._id,
          name: testProduct.name,
          quantity: 1,
          image: testProduct.image,
          price: testProduct.price
        }],
        shippingAddress: {
          name: 'Digital Customer',
          addressLine1: '456 Digital Lane',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: 'digital@example.com'
        },
        paymentMethod: 'Digital',
        itemsPrice: 599,
        shippingPrice: 0,
        totalPrice: 599
      };

      const res = await request(app)
        .post('/api/orders/new')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.order.paymentMethod).toBe('Digital');
    });

    it('should fail without authentication', async () => {
      const orderData = {
        orderItems: [{
          product: testProduct._id,
          name: testProduct.name,
          quantity: 1,
          image: testProduct.image,
          price: testProduct.price
        }],
        shippingAddress: {
          name: 'Test Customer',
          addressLine1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: 'customer@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 599,
        shippingPrice: 50,
        totalPrice: 649
      };

      const res = await request(app)
        .post('/api/orders/new')
        .send(orderData);

      expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .post('/api/orders/new')
        .set('Authorization', 'Bearer invalid-token')
        .send({});

      expect(res.statusCode).toBe(401);
    });

    it('should create order with multiple items', async () => {
      const secondProduct = await Product.create({
        name: 'Test Foundation',
        slug: 'test-foundation-' + Date.now(),
        price: 1299,
        category: 'face',
        description: 'A test foundation',
        image: 'https://example.com/foundation.jpg',
        inStock: true
      });

      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 2,
            image: testProduct.image,
            price: testProduct.price
          },
          {
            product: secondProduct._id,
            name: secondProduct.name,
            quantity: 1,
            image: secondProduct.image,
            price: secondProduct.price
          }
        ],
        shippingAddress: {
          name: 'Multi Item Customer',
          addressLine1: '789 Multi Street',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          phone: '9876543212',
          email: 'multi@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 2497,
        shippingPrice: 0,
        totalPrice: 2497
      };

      const res = await request(app)
        .post('/api/orders/new')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.order.orderItems).toHaveLength(2);
    });

    it('should generate unique order number', async () => {
      const orderData = {
        orderItems: [{
          product: testProduct._id,
          name: testProduct.name,
          quantity: 1,
          image: testProduct.image,
          price: testProduct.price
        }],
        shippingAddress: {
          name: 'Order Number Test',
          addressLine1: '111 Number Street',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          phone: '9876543213',
          email: 'number@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 599,
        shippingPrice: 50,
        totalPrice: 649
      };

      const res = await request(app)
        .post('/api/orders/new')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(201);

      // Fetch the order to check orderNumber
      const createdOrder = await Order.findById(res.body.order._id);
      expect(createdOrder.orderNumber).toBeDefined();
      expect(createdOrder.orderNumber).toMatch(/^ORD-/);
    });
  });

  describe('GET /api/orders/me', () => {
    beforeEach(async () => {
      // Create some orders for the test user
      await Order.create({
        user: testUser._id,
        orderItems: [{
          product: testProduct._id,
          name: 'Order 1 Product',
          quantity: 1,
          image: 'https://example.com/img.jpg',
          price: 599
        }],
        shippingAddress: {
          name: 'Test',
          addressLine1: 'Test Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: 'test@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 599,
        shippingPrice: 50,
        totalPrice: 649
      });

      await Order.create({
        user: testUser._id,
        orderItems: [{
          product: testProduct._id,
          name: 'Order 2 Product',
          quantity: 2,
          image: 'https://example.com/img2.jpg',
          price: 799
        }],
        shippingAddress: {
          name: 'Test',
          addressLine1: 'Test Address 2',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: 'test2@example.com'
        },
        paymentMethod: 'Digital',
        itemsPrice: 1598,
        shippingPrice: 0,
        totalPrice: 1598
      });
    });

    it('should get current user orders', async () => {
      const res = await request(app)
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders).toHaveLength(2);
    });

    it('should only return orders for the authenticated user', async () => {
      // Create another user with orders
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      await Order.create({
        user: otherUser._id,
        orderItems: [{
          product: testProduct._id,
          name: 'Other User Product',
          quantity: 1,
          image: 'https://example.com/other.jpg',
          price: 999
        }],
        shippingAddress: {
          name: 'Other',
          addressLine1: 'Other Address',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700001',
          phone: '9876543299',
          email: 'other@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 999,
        shippingPrice: 50,
        totalPrice: 1049
      });

      const res = await request(app)
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      // Should only have 2 orders (the test user's orders, not the other user's)
      expect(res.body.orders).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/orders/me');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/orders/track', () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = await Order.create({
        user: testUser._id,
        orderNumber: 'ORD-TEST-123456',
        orderItems: [{
          product: testProduct._id,
          name: 'Trackable Product',
          quantity: 1,
          image: 'https://example.com/track.jpg',
          price: 599
        }],
        shippingAddress: {
          name: 'Track Test',
          addressLine1: 'Track Address',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          phone: '9876543214',
          email: 'track@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 599,
        shippingPrice: 50,
        totalPrice: 649,
        orderStatus: 'processing'
      });
    });

    it('should track order by order number', async () => {
      const res = await request(app)
        .get('/api/orders/track')
        .query({ orderNumber: 'ORD-TEST-123456' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.orderNumber).toBe('ORD-TEST-123456');
      expect(res.body.order.orderStatus).toBe('processing');
    });

    it('should track order by order ID', async () => {
      const res = await request(app)
        .get('/api/orders/track')
        .query({ orderNumber: testOrder._id.toString() });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order._id).toBe(testOrder._id.toString());
    });

    it('should fail without order number', async () => {
      const res = await request(app).get('/api/orders/track');

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/track')
        .query({ orderNumber: 'ORD-NONEXISTENT-999' });

      expect(res.statusCode).toBe(404);
    });

    it('should verify email if provided', async () => {
      const res = await request(app)
        .get('/api/orders/track')
        .query({
          orderNumber: 'ORD-TEST-123456',
          email: 'track@example.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject mismatched email', async () => {
      const res = await request(app)
        .get('/api/orders/track')
        .query({
          orderNumber: 'ORD-TEST-123456',
          email: 'wrong@example.com'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should return limited order info for security', async () => {
      const res = await request(app)
        .get('/api/orders/track')
        .query({ orderNumber: 'ORD-TEST-123456' });

      expect(res.statusCode).toBe(200);
      // Should not include full shipping address for security
      expect(res.body.order.shippingAddress.phone).toBeUndefined();
      expect(res.body.order.shippingAddress.addressLine1).toBeUndefined();
      // Should include partial address
      expect(res.body.order.shippingAddress.city).toBe('Pune');
      expect(res.body.order.shippingAddress.state).toBe('Maharashtra');
    });
  });

  describe('Admin Order Routes', () => {
    let adminUser;
    let adminToken;
    let testOrder;

    beforeEach(async () => {
      // Create admin user
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpass123',
        role: 'admin'
      });
      adminToken = generateToken(adminUser._id);

      // Create test order
      testOrder = await Order.create({
        user: testUser._id,
        orderItems: [{
          product: testProduct._id,
          name: 'Admin Test Product',
          quantity: 1,
          image: 'https://example.com/admin.jpg',
          price: 999
        }],
        shippingAddress: {
          name: 'Admin Test',
          addressLine1: 'Admin Address',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001',
          phone: '9876543215',
          email: 'admintest@example.com'
        },
        paymentMethod: 'COD',
        itemsPrice: 999,
        shippingPrice: 50,
        totalPrice: 1049,
        orderStatus: 'pending'
      });
    });

    describe('GET /api/orders/admin/all', () => {
      it('should get all orders for admin', async () => {
        const res = await request(app)
          .get('/api/orders/admin/all')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.orders).toBeDefined();
        expect(res.body.totalAmount).toBeDefined();
      });

      it('should fail for non-admin user', async () => {
        const res = await request(app)
          .get('/api/orders/admin/all')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
      });

      it('should fail without authentication', async () => {
        const res = await request(app).get('/api/orders/admin/all');

        expect(res.statusCode).toBe(401);
      });
    });

    describe('GET /api/orders/admin/:id', () => {
      it('should get single order for admin', async () => {
        const res = await request(app)
          .get(`/api/orders/admin/${testOrder._id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.order._id).toBe(testOrder._id.toString());
      });

      it('should return 404 for non-existent order', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const res = await request(app)
          .get(`/api/orders/admin/${fakeId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
      });

      it('should fail for non-admin user', async () => {
        const res = await request(app)
          .get(`/api/orders/admin/${testOrder._id}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
      });
    });

    describe('PUT /api/orders/admin/:id', () => {
      it('should update order status', async () => {
        const res = await request(app)
          .put(`/api/orders/admin/${testOrder._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'confirmed' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify status was updated
        const updatedOrder = await Order.findById(testOrder._id);
        expect(updatedOrder.orderStatus).toBe('confirmed');
      });

      it('should update to shipped status', async () => {
        const res = await request(app)
          .put(`/api/orders/admin/${testOrder._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'shipped' });

        expect(res.statusCode).toBe(200);

        const updatedOrder = await Order.findById(testOrder._id);
        expect(updatedOrder.orderStatus).toBe('shipped');
        expect(updatedOrder.shipping.shippedAt).toBeDefined();
      });

      it('should update to delivered status', async () => {
        const res = await request(app)
          .put(`/api/orders/admin/${testOrder._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'delivered' });

        expect(res.statusCode).toBe(200);

        const updatedOrder = await Order.findById(testOrder._id);
        expect(updatedOrder.orderStatus).toBe('delivered');
        expect(updatedOrder.deliveredAt).toBeDefined();
      });

      it('should not update already delivered order', async () => {
        // First mark as delivered
        testOrder.orderStatus = 'delivered';
        testOrder.deliveredAt = new Date();
        await testOrder.save();

        const res = await request(app)
          .put(`/api/orders/admin/${testOrder._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'shipped' });

        expect(res.statusCode).toBe(400);
      });

      it('should return 404 for non-existent order', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const res = await request(app)
          .put(`/api/orders/admin/${fakeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'confirmed' });

        expect(res.statusCode).toBe(404);
      });

      it('should fail for non-admin user', async () => {
        const res = await request(app)
          .put(`/api/orders/admin/${testOrder._id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'confirmed' });

        expect(res.statusCode).toBe(403);
      });
    });
  });
});

describe('Order Model', () => {
  let testUser;
  let testProduct;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Model Test User',
      email: 'modeltest@example.com',
      password: 'password123'
    });

    testProduct = await Product.create({
      name: 'Model Test Product',
      slug: 'model-test-' + Date.now(),
      price: 599,
      category: 'lips',
      description: 'Test product',
      image: 'https://example.com/model.jpg'
    });
  });

  it('should create order with valid data', async () => {
    const order = await Order.create({
      user: testUser._id,
      orderItems: [{
        product: testProduct._id,
        name: 'Test Product',
        quantity: 1,
        image: 'https://example.com/test.jpg',
        price: 599
      }],
      shippingAddress: {
        name: 'Test',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '1234567890',
        email: 'test@test.com'
      },
      paymentMethod: 'COD',
      itemsPrice: 599,
      shippingPrice: 50,
      totalPrice: 649
    });

    expect(order._id).toBeDefined();
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(order.orderStatus).toBe('pending');
  });

  it('should track status history', async () => {
    const order = await Order.create({
      user: testUser._id,
      orderItems: [{
        product: testProduct._id,
        name: 'History Test',
        quantity: 1,
        image: 'https://example.com/history.jpg',
        price: 599
      }],
      shippingAddress: {
        name: 'History',
        addressLine1: '456 History Ave',
        city: 'History City',
        state: 'History State',
        pincode: '654321',
        phone: '0987654321',
        email: 'history@test.com'
      },
      paymentMethod: 'COD',
      itemsPrice: 599,
      shippingPrice: 50,
      totalPrice: 649
    });

    // Update status
    order.orderStatus = 'confirmed';
    await order.save();

    expect(order.statusHistory.length).toBeGreaterThan(0);
    expect(order.statusHistory.some(h => h.status === 'confirmed')).toBe(true);
  });

  it('should use updateStatus method correctly', async () => {
    const order = await Order.create({
      user: testUser._id,
      orderItems: [{
        product: testProduct._id,
        name: 'Method Test',
        quantity: 1,
        image: 'https://example.com/method.jpg',
        price: 599
      }],
      shippingAddress: {
        name: 'Method',
        addressLine1: '789 Method Blvd',
        city: 'Method City',
        state: 'Method State',
        pincode: '789012',
        phone: '5555555555',
        email: 'method@test.com'
      },
      paymentMethod: 'COD',
      itemsPrice: 599,
      shippingPrice: 50,
      totalPrice: 649
    });

    await order.updateStatus('shipped', {
      location: 'Mumbai Hub',
      description: 'Package shipped from warehouse'
    });

    expect(order.orderStatus).toBe('shipped');
    // The updateStatus method adds an entry with location, then pre-save hook adds another
    // Find the entry that has the location field
    const historyWithLocation = order.statusHistory.find(
      h => h.status === 'shipped' && h.location === 'Mumbai Hub'
    );
    expect(historyWithLocation).toBeDefined();
    expect(historyWithLocation.description).toBe('Package shipped from warehouse');
  });

  it('should cancel order correctly', async () => {
    const order = await Order.create({
      user: testUser._id,
      orderItems: [{
        product: testProduct._id,
        name: 'Cancel Test',
        quantity: 1,
        image: 'https://example.com/cancel.jpg',
        price: 599
      }],
      shippingAddress: {
        name: 'Cancel',
        addressLine1: '999 Cancel Rd',
        city: 'Cancel City',
        state: 'Cancel State',
        pincode: '999999',
        phone: '9999999999',
        email: 'cancel@test.com'
      },
      paymentMethod: 'Digital',
      itemsPrice: 599,
      shippingPrice: 50,
      totalPrice: 649
    });

    await order.cancelOrder('Customer requested cancellation', testUser._id);

    expect(order.orderStatus).toBe('cancelled');
    expect(order.cancellation.reason).toBe('Customer requested cancellation');
    expect(order.cancellation.refundStatus).toBe('pending');
  });

  it('should get current tracking status virtual', async () => {
    const order = await Order.create({
      user: testUser._id,
      orderItems: [{
        product: testProduct._id,
        name: 'Virtual Test',
        quantity: 1,
        image: 'https://example.com/virtual.jpg',
        price: 599
      }],
      shippingAddress: {
        name: 'Virtual',
        addressLine1: '111 Virtual Way',
        city: 'Virtual City',
        state: 'Virtual State',
        pincode: '111111',
        phone: '1111111111',
        email: 'virtual@test.com'
      },
      paymentMethod: 'COD',
      itemsPrice: 599,
      shippingPrice: 50,
      totalPrice: 649
    });

    order.orderStatus = 'processing';
    await order.save();

    const orderJSON = order.toJSON();
    expect(orderJSON.currentTrackingStatus).toBeDefined();
    expect(orderJSON.currentTrackingStatus.status).toBe('processing');
  });
});
