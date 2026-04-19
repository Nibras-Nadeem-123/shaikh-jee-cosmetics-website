/**
 * Swagger/OpenAPI Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shaikh Jee Cosmetics API',
      version: '1.0.0',
      description: 'API documentation for Shaikh Jee Cosmetics e-commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@shaikhjee.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.shaikhjee.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['customer', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            price: { type: 'number' },
            originalPrice: { type: 'number' },
            category: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            reviewCount: { type: 'number' },
            inStock: { type: 'boolean' },
            shades: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  hex: { type: 'string' }
                }
              }
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            user: { type: 'string' },
            orderItems: { type: 'array' },
            totalPrice: { type: 'number' },
            orderStatus: { type: 'string' },
            paymentMethod: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            perPage: { type: 'integer' },
            currentPage: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Wishlist', description: 'Wishlist management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Users', description: 'User management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Admin', description: 'Admin-only endpoints' }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);

// API documentation in-code comments
export const apiDocs = {
  // Auth endpoints
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', minLength: 2 },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'User created successfully' },
        400: { description: 'Validation error' }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Login successful' },
        401: { description: 'Invalid credentials' }
      }
    }
  },
  '/products': {
    get: {
      tags: ['Products'],
      summary: 'Get all products',
      parameters: [
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'minPrice', in: 'query', schema: { type: 'number' } },
        { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
        { name: 'sort', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } }
      ],
      responses: {
        200: { description: 'List of products' }
      }
    }
  },
  '/products/{slug}': {
    get: {
      tags: ['Products'],
      summary: 'Get product by slug',
      parameters: [
        { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Product details' },
        404: { description: 'Product not found' }
      }
    }
  }
};

export default swaggerSpec;
