import request from 'supertest';
import express from 'express';
import Product from '../models/Product.js';
import productRoutes from '../routes/product.js';
import { errorMiddleware } from '../middleware/errorHandler.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productRoutes);
  app.use(errorMiddleware);
  return app;
};

describe('Product Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await Product.create([
        {
          name: 'Lipstick Red',
          slug: 'lipstick-red',
          price: 599,
          originalPrice: 799,
          category: 'lips',
          description: 'A beautiful red lipstick',
          image: 'https://example.com/lipstick.jpg',
          inStock: true,
          rating: 4.5
        },
        {
          name: 'Foundation Light',
          slug: 'foundation-light',
          price: 1299,
          originalPrice: 1599,
          category: 'face',
          description: 'Light coverage foundation',
          image: 'https://example.com/foundation.jpg',
          inStock: true,
          rating: 4.0
        },
        {
          name: 'Mascara Black',
          slug: 'mascara-black',
          price: 449,
          originalPrice: 549,
          category: 'eyes',
          description: 'Volumizing black mascara',
          image: 'https://example.com/mascara.jpg',
          inStock: false,
          rating: 4.8
        }
      ]);
    });

    it('should get all products', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products).toHaveLength(3);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=lips');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].category).toBe('lips');
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=500&maxPrice=1000');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // Should return lipstick (599) only
      expect(res.body.products.every(p => p.price >= 500 && p.price <= 1000)).toBe(true);
    });

    it('should sort products by price ascending', async () => {
      const res = await request(app).get('/api/products?sort=price');

      expect(res.statusCode).toBe(200);
      expect(res.body.products[0].price).toBeLessThanOrEqual(res.body.products[1].price);
    });

    it('should sort products by price descending', async () => {
      const res = await request(app).get('/api/products?sort=-price');

      expect(res.statusCode).toBe(200);
      expect(res.body.products[0].price).toBeGreaterThanOrEqual(res.body.products[1].price);
    });

    it('should paginate products', async () => {
      const res = await request(app).get('/api/products?page=1&limit=2');

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(2);
    });
  });

  describe('GET /api/products/:slug', () => {
    beforeEach(async () => {
      await Product.create({
        name: 'Test Product',
        slug: 'test-product',
        price: 999,
        originalPrice: 1299,
        category: 'makeup',
        description: 'A test product',
        image: 'https://example.com/test.jpg',
        inStock: true
      });
    });

    it('should get product by slug', async () => {
      const res = await request(app).get('/api/products/test-product');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.slug).toBe('test-product');
      expect(res.body.product.name).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/non-existent-slug');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/products/search/suggestions', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Matte Lipstick',
          slug: 'matte-lipstick',
          price: 599,
          category: 'lips',
          description: 'Matte finish lipstick',
          image: 'https://example.com/matte.jpg',
          inStock: true
        },
        {
          name: 'Matte Foundation',
          slug: 'matte-foundation',
          price: 1299,
          category: 'face',
          description: 'Matte foundation',
          image: 'https://example.com/foundation.jpg',
          inStock: true
        }
      ]);
    });

    it('should return search suggestions', async () => {
      const res = await request(app).get('/api/products/search/suggestions?q=matte');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.suggestions.length).toBeGreaterThan(0);
    });

    it('should return empty for no matches', async () => {
      const res = await request(app).get('/api/products/search/suggestions?q=xyz123');

      expect(res.statusCode).toBe(200);
      expect(res.body.suggestions).toHaveLength(0);
    });
  });
});

describe('Product Model', () => {
  it('should create a product with valid data', async () => {
    const product = await Product.create({
      name: 'New Product',
      slug: 'new-product',
      price: 799,
      category: 'skincare',
      description: 'A new skincare product',
      image: 'https://example.com/new.jpg'
    });

    expect(product._id).toBeDefined();
    expect(product.name).toBe('New Product');
    expect(product.inStock).toBe(true); // default value
  });

  it('should fail without required fields', async () => {
    await expect(Product.create({})).rejects.toThrow();
  });

  it('should enforce unique slug', async () => {
    await Product.create({
      name: 'Product 1',
      slug: 'unique-slug',
      price: 599,
      category: 'lips',
      description: 'First product',
      image: 'https://example.com/1.jpg'
    });

    await expect(Product.create({
      name: 'Product 2',
      slug: 'unique-slug',
      price: 699,
      category: 'lips',
      description: 'Second product',
      image: 'https://example.com/2.jpg'
    })).rejects.toThrow();
  });
});
