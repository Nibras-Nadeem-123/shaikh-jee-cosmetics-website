/**
 * Low Stock Alert Service
 * Monitors inventory levels and sends admin notifications when products hit low stock thresholds
 */

import Product from '../models/Product.js';
import { sendLowStockAlertEmail, sendSingleProductLowStockAlert } from './email.js';
import { getCache, setCache } from '../config/redis.js';

// Cache key for tracking sent notifications (prevents spam)
const NOTIFICATION_CACHE_PREFIX = 'lowstock:notified:';
const NOTIFICATION_CACHE_TTL = 24 * 60 * 60; // 24 hours - don't re-notify for same product within 24h
const BATCH_NOTIFICATION_CACHE_KEY = 'lowstock:batch:lastSent';
const BATCH_NOTIFICATION_INTERVAL = 6 * 60 * 60; // 6 hours minimum between batch notifications

/**
 * Check if a product is at low stock level
 */
export const isLowStock = (product) => {
  if (!product.inventory?.trackInventory) return false;

  const quantity = product.inventory?.quantity ?? product.quantity ?? 0;
  const threshold = product.inventory?.lowStockThreshold ?? 10;

  return quantity <= threshold && quantity > 0;
};

/**
 * Check if a product is at critical stock level (half of threshold or less)
 */
export const isCriticalStock = (product) => {
  if (!product.inventory?.trackInventory) return false;

  const quantity = product.inventory?.quantity ?? product.quantity ?? 0;
  const threshold = product.inventory?.lowStockThreshold ?? 10;

  return quantity <= Math.floor(threshold / 2) && quantity > 0;
};

/**
 * Check if notification was already sent for this product recently
 */
const wasRecentlyNotified = async (productId) => {
  try {
    const cached = await getCache(`${NOTIFICATION_CACHE_PREFIX}${productId}`);
    return !!cached;
  } catch (error) {
    // If Redis is down, allow notification
    return false;
  }
};

/**
 * Mark product as notified
 */
const markAsNotified = async (productId) => {
  try {
    await setCache(`${NOTIFICATION_CACHE_PREFIX}${productId}`, true, NOTIFICATION_CACHE_TTL);
  } catch (error) {
    console.error('[LowStock] Failed to cache notification status:', error.message);
  }
};

/**
 * Check and send alert for a single product after stock change
 * Call this after any stock deduction (order completion, manual adjustment)
 */
export const checkAndAlertLowStock = async (product) => {
  try {
    // Skip if not tracking inventory or not low stock
    if (!isLowStock(product)) {
      return { alerted: false, reason: 'not_low_stock' };
    }

    // Check if already notified recently
    const alreadyNotified = await wasRecentlyNotified(product._id.toString());
    if (alreadyNotified) {
      return { alerted: false, reason: 'recently_notified' };
    }

    // Send alert
    await sendSingleProductLowStockAlert(product);

    // Mark as notified
    await markAsNotified(product._id.toString());

    console.log(`[LowStock] Alert sent for product: ${product.name} (${product._id})`);

    return { alerted: true, product: product.name };
  } catch (error) {
    console.error('[LowStock] Failed to send alert:', error.message);
    return { alerted: false, error: error.message };
  }
};

/**
 * Batch check all products for low stock
 * Intended to run periodically via scheduler
 */
export const checkAllProductsLowStock = async () => {
  const results = {
    checked: 0,
    lowStockCount: 0,
    criticalCount: 0,
    notificationSent: false,
    products: []
  };

  try {
    // Check if batch notification was sent recently
    const lastBatchSent = await getCache(BATCH_NOTIFICATION_CACHE_KEY);
    if (lastBatchSent) {
      const hoursSinceLastBatch = (Date.now() - parseInt(lastBatchSent)) / (1000 * 60 * 60);
      if (hoursSinceLastBatch < 6) {
        console.log(`[LowStock] Skipping batch check - last sent ${hoursSinceLastBatch.toFixed(1)} hours ago`);
        return { ...results, skipped: true, reason: 'recently_sent' };
      }
    }

    // Find all products with inventory tracking enabled
    const products = await Product.find({
      'inventory.trackInventory': true,
      $expr: {
        $lte: ['$inventory.quantity', '$inventory.lowStockThreshold']
      },
      'inventory.quantity': { $gt: 0 } // Exclude out of stock
    }).select('name slug sku image images inventory quantity price');

    results.checked = products.length;

    if (products.length === 0) {
      console.log('[LowStock] No products at low stock level');
      return results;
    }

    // Categorize products
    const lowStockProducts = [];
    const criticalProducts = [];

    for (const product of products) {
      const quantity = product.inventory?.quantity ?? product.quantity ?? 0;
      const threshold = product.inventory?.lowStockThreshold ?? 10;

      if (quantity <= Math.floor(threshold / 2)) {
        criticalProducts.push(product);
      }
      lowStockProducts.push(product);
    }

    results.lowStockCount = lowStockProducts.length;
    results.criticalCount = criticalProducts.length;
    results.products = lowStockProducts.map(p => ({
      id: p._id,
      name: p.name,
      stock: p.inventory?.quantity ?? p.quantity,
      threshold: p.inventory?.lowStockThreshold ?? 10
    }));

    // Send batch notification if there are low stock products
    if (lowStockProducts.length > 0) {
      await sendLowStockAlertEmail(lowStockProducts);
      results.notificationSent = true;

      // Update last batch sent timestamp
      await setCache(BATCH_NOTIFICATION_CACHE_KEY, Date.now().toString(), BATCH_NOTIFICATION_INTERVAL);

      console.log(`[LowStock] Batch alert sent: ${lowStockProducts.length} products low, ${criticalProducts.length} critical`);
    }

    return results;
  } catch (error) {
    console.error('[LowStock] Batch check failed:', error.message);
    return { ...results, error: error.message };
  }
};

/**
 * Get current low stock products (for admin dashboard)
 */
export const getLowStockProducts = async () => {
  try {
    const products = await Product.find({
      'inventory.trackInventory': true,
      $expr: {
        $lte: ['$inventory.quantity', '$inventory.lowStockThreshold']
      }
    })
      .select('name slug sku image images inventory quantity price inStock')
      .sort({ 'inventory.quantity': 1 }) // Most critical first
      .limit(50);

    return products.map(p => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      image: p.images?.[0] || p.image,
      currentStock: p.inventory?.quantity ?? p.quantity ?? 0,
      threshold: p.inventory?.lowStockThreshold ?? 10,
      inStock: p.inStock,
      isCritical: (p.inventory?.quantity ?? 0) <= Math.floor((p.inventory?.lowStockThreshold ?? 10) / 2)
    }));
  } catch (error) {
    console.error('[LowStock] Failed to get low stock products:', error.message);
    return [];
  }
};

/**
 * Get low stock statistics
 */
export const getLowStockStats = async () => {
  try {
    const [lowStockCount, criticalCount, outOfStockCount, totalTracked] = await Promise.all([
      // Low stock (at or below threshold, but > 0)
      Product.countDocuments({
        'inventory.trackInventory': true,
        $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] },
        'inventory.quantity': { $gt: 0 }
      }),
      // Critical (at or below half threshold, but > 0)
      Product.countDocuments({
        'inventory.trackInventory': true,
        $expr: { $lte: ['$inventory.quantity', { $divide: ['$inventory.lowStockThreshold', 2] }] },
        'inventory.quantity': { $gt: 0 }
      }),
      // Out of stock
      Product.countDocuments({
        'inventory.trackInventory': true,
        'inventory.quantity': { $lte: 0 }
      }),
      // Total tracked products
      Product.countDocuments({ 'inventory.trackInventory': true })
    ]);

    return {
      lowStock: lowStockCount,
      critical: criticalCount,
      outOfStock: outOfStockCount,
      totalTracked,
      healthyStock: totalTracked - lowStockCount - outOfStockCount
    };
  } catch (error) {
    console.error('[LowStock] Failed to get stats:', error.message);
    return {
      lowStock: 0,
      critical: 0,
      outOfStock: 0,
      totalTracked: 0,
      healthyStock: 0
    };
  }
};

export default {
  isLowStock,
  isCriticalStock,
  checkAndAlertLowStock,
  checkAllProductsLowStock,
  getLowStockProducts,
  getLowStockStats
};
