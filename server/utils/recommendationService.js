/**
 * Product Recommendation Service
 * Provides various recommendation algorithms for product suggestions
 */

import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { getCache, setCache } from '../config/redis.js';

const CACHE_TTL = 3600; // 1 hour

/**
 * Get related products based on category and subcategory
 */
export const getRelatedProducts = async (productId, limit = 4) => {
  const cacheKey = `recommendations:related:${productId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const product = await Product.findById(productId);
  if (!product) return [];

  const relatedProducts = await Product.find({
    _id: { $ne: productId },
    inStock: true,
    $or: [
      { category: product.category, subcategory: product.subcategory },
      { category: product.category },
      { brand: product.brand }
    ]
  })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .select('name slug price originalPrice image rating reviewCount category');

  await setCache(cacheKey, relatedProducts, CACHE_TTL);
  return relatedProducts;
};

/**
 * Get "Frequently Bought Together" products
 * Based on products that appear together in orders
 */
export const getFrequentlyBoughtTogether = async (productId, limit = 3) => {
  const cacheKey = `recommendations:fbt:${productId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Find orders containing this product
  const orders = await Order.find({
    'orderItems.product': productId
  }).select('orderItems.product');

  // Count co-occurrences
  const coOccurrences = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const itemId = item.product.toString();
      if (itemId !== productId.toString()) {
        coOccurrences[itemId] = (coOccurrences[itemId] || 0) + 1;
      }
    });
  });

  // Sort by frequency and get top products
  const topProductIds = Object.entries(coOccurrences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topProductIds.length === 0) {
    // Fallback to related products
    return getRelatedProducts(productId, limit);
  }

  const products = await Product.find({
    _id: { $in: topProductIds },
    inStock: true
  }).select('name slug price originalPrice image rating reviewCount category');

  await setCache(cacheKey, products, CACHE_TTL);
  return products;
};

/**
 * Get personalized recommendations based on user's order history
 */
export const getPersonalizedRecommendations = async (userId, limit = 8) => {
  const cacheKey = `recommendations:personalized:${userId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Get user's order history
  const userOrders = await Order.find({ user: userId })
    .select('orderItems.product')
    .sort({ createdAt: -1 })
    .limit(10);

  if (userOrders.length === 0) {
    // No order history, return trending products
    return getTrendingProducts(limit);
  }

  // Extract purchased product IDs and categories
  const purchasedProductIds = [];
  const purchasedProducts = [];

  for (const order of userOrders) {
    for (const item of order.orderItems) {
      purchasedProductIds.push(item.product);
    }
  }

  // Get details of purchased products
  const products = await Product.find({
    _id: { $in: purchasedProductIds }
  }).select('category subcategory brand');

  // Analyze preferences
  const categoryPrefs = {};
  const brandPrefs = {};

  products.forEach(p => {
    categoryPrefs[p.category] = (categoryPrefs[p.category] || 0) + 1;
    if (p.brand) {
      brandPrefs[p.brand] = (brandPrefs[p.brand] || 0) + 1;
    }
  });

  // Get top categories and brands
  const topCategories = Object.entries(categoryPrefs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const topBrands = Object.entries(brandPrefs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([brand]) => brand);

  // Find recommendations
  const recommendations = await Product.find({
    _id: { $nin: purchasedProductIds },
    inStock: true,
    $or: [
      { category: { $in: topCategories } },
      { brand: { $in: topBrands } }
    ]
  })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .select('name slug price originalPrice image rating reviewCount category brand');

  await setCache(cacheKey, recommendations, CACHE_TTL / 2); // Shorter TTL for personalized
  return recommendations;
};

/**
 * Get trending products based on recent orders and views
 */
export const getTrendingProducts = async (limit = 8) => {
  const cacheKey = 'recommendations:trending';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Get products from recent orders (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentOrders = await Order.aggregate([
    { $match: { createdAt: { $gte: weekAgo } } },
    { $unwind: '$orderItems' },
    { $group: {
      _id: '$orderItems.product',
      orderCount: { $sum: 1 },
      totalQuantity: { $sum: '$orderItems.quantity' }
    }},
    { $sort: { orderCount: -1, totalQuantity: -1 } },
    { $limit: limit * 2 }
  ]);

  const productIds = recentOrders.map(r => r._id);

  const products = await Product.find({
    _id: { $in: productIds },
    inStock: true
  }).select('name slug price originalPrice image rating reviewCount category');

  // Sort by order count
  const orderedProducts = productIds
    .map(id => products.find(p => p._id.toString() === id.toString()))
    .filter(Boolean)
    .slice(0, limit);

  // If not enough trending, fill with best sellers
  if (orderedProducts.length < limit) {
    const additionalProducts = await Product.find({
      _id: { $nin: productIds },
      inStock: true,
      isBestSeller: true
    })
      .sort({ rating: -1 })
      .limit(limit - orderedProducts.length)
      .select('name slug price originalPrice image rating reviewCount category');

    orderedProducts.push(...additionalProducts);
  }

  await setCache(cacheKey, orderedProducts, CACHE_TTL);
  return orderedProducts;
};

/**
 * Get "Customers Also Viewed" based on similar browsing patterns
 * (Simplified version - in production, you'd track actual views)
 */
export const getCustomersAlsoViewed = async (productId, limit = 4) => {
  const cacheKey = `recommendations:alsoviewed:${productId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const product = await Product.findById(productId);
  if (!product) return [];

  // Find similar products based on price range and category
  const priceRange = {
    min: product.price * 0.7,
    max: product.price * 1.3
  };

  const similarProducts = await Product.find({
    _id: { $ne: productId },
    category: product.category,
    price: { $gte: priceRange.min, $lte: priceRange.max },
    inStock: true
  })
    .sort({ rating: -1 })
    .limit(limit)
    .select('name slug price originalPrice image rating reviewCount category');

  await setCache(cacheKey, similarProducts, CACHE_TTL);
  return similarProducts;
};

/**
 * Get new arrivals
 */
export const getNewArrivals = async (limit = 8) => {
  const cacheKey = 'recommendations:newarrivals';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const products = await Product.find({
    inStock: true,
    isNewProduct: true
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name slug price originalPrice image rating reviewCount category');

  await setCache(cacheKey, products, CACHE_TTL);
  return products;
};

export default {
  getRelatedProducts,
  getFrequentlyBoughtTogether,
  getPersonalizedRecommendations,
  getTrendingProducts,
  getCustomersAlsoViewed,
  getNewArrivals
};
