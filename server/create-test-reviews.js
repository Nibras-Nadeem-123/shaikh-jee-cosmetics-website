/**
 * Create Test Reviews Script
 * 
 * Usage: node create-test-reviews.js
 * 
 * This script creates sample reviews for testing the review system.
 * Make sure the backend server is running.
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

// Test user credentials (create this user first via signup)
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test@123',
  name: 'Test User'
};

// Sample reviews
const SAMPLE_REVIEWS = [
  {
    productId: '', // Will be set dynamically
    rating: 5,
    comment: 'Absolutely love this product! The quality is exceptional and it arrived quickly. Will definitely purchase again.'
  },
  {
    productId: '',
    rating: 4,
    comment: 'Great product overall. Works as described and the packaging was beautiful. Only minor issue was the delivery took a bit longer than expected.'
  },
  {
    productId: '',
    rating: 5,
    comment: 'Best purchase I have made this year! The results were visible within days. Highly recommend to anyone looking for quality cosmetics.'
  },
  {
    productId: '',
    rating: 3,
    comment: 'Product is okay. Not bad but not exceptional either. Expected more based on the reviews but it does the job.'
  },
  {
    productId: '',
    rating: 5,
    comment: 'Amazing! Exceeded all my expectations. The texture, the fragrance, everything is perfect. Worth every penny!'
  }
];

async function login() {
  try {
    // First try to signup (if user doesn't exist)
    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (signupResponse.ok) {
      const data = await signupResponse.json();
      console.log('✅ Created test user');
      return data.token;
    }

    // If signup fails (user exists), login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const data = await loginResponse.json();
    console.log('✅ Logged in as test user');
    return data.token;
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return null;
  }
}

async function getFirstProduct() {
  try {
    const response = await fetch(`${API_URL}/products?limit=1`);
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      return data.products[0]._id;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    return null;
  }
}

async function createReview(token, productId, rating, comment) {
  try {
    const response = await fetch(`${API_URL}/reviews/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, rating, comment })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Review created (Rating: ${rating}/5)`);
      return true;
    } else {
      console.log(`⚠️  ${data.message}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating review:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Test Review Creation...\n');

  // Check backend health
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    
    if (!health.success) {
      console.log('❌ Backend is not healthy');
      return;
    }
    
    console.log('✅ Backend is healthy');
  } catch (error) {
    console.log('❌ Backend is not running. Start it first: cd server && node server.js');
    return;
  }

  // Login
  const token = await login();
  if (!token) {
    console.log('❌ Failed to authenticate. Exiting...');
    return;
  }

  // Get a product
  const productId = await getFirstProduct();
  if (!productId) {
    console.log('❌ No products found. Add some products first.');
    return;
  }

  console.log(`✅ Using product: ${productId}\n`);

  // Create reviews
  console.log('📝 Creating reviews...\n');
  
  for (const review of SAMPLE_REVIEWS) {
    await createReview(token, productId, review.rating, review.comment);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Test reviews created successfully!');
  console.log(`\n📍 View reviews at: http://localhost:3000/product/[product-slug]`);
  console.log(`📍 API endpoint: ${API_URL}/reviews/product/${productId}`);
}

main().catch(console.error);
