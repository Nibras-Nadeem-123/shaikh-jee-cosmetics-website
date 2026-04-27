/**
 * Enhanced Redis Caching Service
 * Provides structured caching with key management, tags, and invalidation strategies
 */

import { getRedisClient, isRedisConnected } from '../config/redis.js';
import logger from '../utils/logger.js';

// Cache key prefixes for organization
export const CACHE_KEYS = {
  // Products
  PRODUCTS_LIST: 'products:list',
  PRODUCT_DETAIL: 'products:detail',
  PRODUCT_SLUG: 'products:slug',
  PRODUCTS_FEATURED: 'products:featured',
  PRODUCTS_CATEGORY: 'products:category',
  PRODUCTS_SEARCH: 'products:search',

  // Categories
  CATEGORIES_LIST: 'categories:list',
  CATEGORY_DETAIL: 'categories:detail',

  // Reviews
  REVIEWS_PRODUCT: 'reviews:product',
  REVIEWS_USER: 'reviews:user',

  // Orders
  ORDER_DETAIL: 'orders:detail',
  ORDERS_USER: 'orders:user',

  // User
  USER_PROFILE: 'users:profile',
  USER_WISHLIST: 'users:wishlist',

  // Stats
  STATS_DASHBOARD: 'stats:dashboard',
  STATS_PRODUCTS: 'stats:products',

  // Misc
  DISCOUNT_CODE: 'discount:code',
  SETTINGS: 'settings',
};

// Default TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  EXTENDED: 86400,     // 24 hours
  WEEK: 604800,        // 7 days
};

/**
 * Cache Service class with advanced features
 */
class CacheService {
  constructor() {
    this.defaultTTL = CACHE_TTL.MEDIUM;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Check if Redis is available
   */
  isAvailable() {
    return isRedisConnected();
  }

  /**
   * Get the Redis client
   */
  getClient() {
    return getRedisClient();
  }

  /**
   * Generate a cache key with prefix
   */
  generateKey(prefix, ...parts) {
    const key = [prefix, ...parts].filter(Boolean).join(':');
    return key.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Get cached data
   */
  async get(key) {
    if (!this.isAvailable()) return null;

    try {
      const client = this.getClient();
      const data = await client.get(key);

      if (data) {
        this.stats.hits++;
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(data);
      }

      this.stats.misses++;
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache GET error: ${key}`, error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isAvailable()) return false;

    try {
      const client = this.getClient();
      await client.setEx(key, ttl, JSON.stringify(value));
      this.stats.sets++;
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`Cache SET error: ${key}`, error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  async delete(key) {
    if (!this.isAvailable()) return false;

    try {
      const client = this.getClient();
      await client.del(key);
      this.stats.deletes++;
      logger.debug(`Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache DELETE error: ${key}`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern) {
    if (!this.isAvailable()) return 0;

    try {
      const client = this.getClient();
      const keys = await client.keys(pattern);

      if (keys.length === 0) return 0;

      await client.del(keys);
      this.stats.deletes += keys.length;
      logger.debug(`Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
      return keys.length;
    } catch (error) {
      logger.error(`Cache DELETE pattern error: ${pattern}`, error);
      return 0;
    }
  }

  /**
   * Get or set - fetch from cache or compute and cache
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await fetchFn();

      // Cache the result
      if (data !== null && data !== undefined) {
        await this.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      logger.error(`Cache getOrSet error: ${key}`, error);
      throw error;
    }
  }

  /**
   * Add tags to a cached key for group invalidation
   */
  async setWithTags(key, value, tags = [], ttl = this.defaultTTL) {
    if (!this.isAvailable()) return false;

    try {
      const client = this.getClient();

      // Set the main value
      await client.setEx(key, ttl, JSON.stringify(value));

      // Add key to each tag set
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        await client.sAdd(tagKey, key);
        await client.expire(tagKey, ttl + 3600); // Tag expires 1 hour after longest key
      }

      this.stats.sets++;
      logger.debug(`Cache SET with tags: ${key} [${tags.join(', ')}]`);
      return true;
    } catch (error) {
      logger.error(`Cache SET with tags error: ${key}`, error);
      return false;
    }
  }

  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateTag(tag) {
    if (!this.isAvailable()) return 0;

    try {
      const client = this.getClient();
      const tagKey = `tag:${tag}`;

      // Get all keys with this tag
      const keys = await client.sMembers(tagKey);

      if (keys.length === 0) return 0;

      // Delete all tagged keys
      await client.del([...keys, tagKey]);
      this.stats.deletes += keys.length;

      logger.debug(`Cache INVALIDATE tag: ${tag} (${keys.length} keys)`);
      return keys.length;
    } catch (error) {
      logger.error(`Cache INVALIDATE tag error: ${tag}`, error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key) {
    if (!this.isAvailable()) return false;

    try {
      const client = this.getClient();
      return (await client.exists(key)) === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async getTTL(key) {
    if (!this.isAvailable()) return -1;

    try {
      const client = this.getClient();
      return await client.ttl(key);
    } catch (error) {
      return -1;
    }
  }

  /**
   * Extend TTL of a key
   */
  async extendTTL(key, ttl) {
    if (!this.isAvailable()) return false;

    try {
      const client = this.getClient();
      await client.expire(key, ttl);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Flush all cache (use with caution!)
   */
  async flushAll() {
    if (!this.isAvailable()) return false;

    try {
      const client = this.getClient();
      await client.flushDb();
      logger.warn('Cache FLUSHED ALL');
      return true;
    } catch (error) {
      logger.error('Cache FLUSH error', error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern) {
    if (!this.isAvailable()) return [];

    try {
      const client = this.getClient();
      return await client.keys(pattern);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get cache info (keys count, memory usage)
   */
  async getInfo() {
    if (!this.isAvailable()) {
      return { connected: false };
    }

    try {
      const client = this.getClient();
      const info = await client.info('memory');
      const dbSize = await client.dbSize();

      return {
        connected: true,
        keys: dbSize,
        memoryInfo: info,
        stats: this.getStats(),
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// =====================================================
// Product-specific caching helpers
// =====================================================

export const productCache = {
  /**
   * Cache product list
   */
  async setList(params, data, ttl = CACHE_TTL.MEDIUM) {
    const key = cacheService.generateKey(
      CACHE_KEYS.PRODUCTS_LIST,
      JSON.stringify(params)
    );
    return cacheService.setWithTags(key, data, ['products'], ttl);
  },

  /**
   * Get cached product list
   */
  async getList(params) {
    const key = cacheService.generateKey(
      CACHE_KEYS.PRODUCTS_LIST,
      JSON.stringify(params)
    );
    return cacheService.get(key);
  },

  /**
   * Cache single product by ID
   */
  async setById(productId, data, ttl = CACHE_TTL.LONG) {
    const key = cacheService.generateKey(CACHE_KEYS.PRODUCT_DETAIL, productId);
    return cacheService.setWithTags(key, data, ['products', `product:${productId}`], ttl);
  },

  /**
   * Get cached product by ID
   */
  async getById(productId) {
    const key = cacheService.generateKey(CACHE_KEYS.PRODUCT_DETAIL, productId);
    return cacheService.get(key);
  },

  /**
   * Cache product by slug
   */
  async setBySlug(slug, data, ttl = CACHE_TTL.LONG) {
    const key = cacheService.generateKey(CACHE_KEYS.PRODUCT_SLUG, slug);
    return cacheService.setWithTags(key, data, ['products'], ttl);
  },

  /**
   * Get cached product by slug
   */
  async getBySlug(slug) {
    const key = cacheService.generateKey(CACHE_KEYS.PRODUCT_SLUG, slug);
    return cacheService.get(key);
  },

  /**
   * Invalidate all product caches
   */
  async invalidateAll() {
    return cacheService.invalidateTag('products');
  },

  /**
   * Invalidate specific product cache
   */
  async invalidateProduct(productId) {
    await cacheService.invalidateTag(`product:${productId}`);
    // Also invalidate product lists as they may contain this product
    await cacheService.deletePattern(`${CACHE_KEYS.PRODUCTS_LIST}:*`);
  },
};

// =====================================================
// Review-specific caching helpers
// =====================================================

export const reviewCache = {
  /**
   * Cache reviews for a product
   */
  async setForProduct(productId, data, ttl = CACHE_TTL.MEDIUM) {
    const key = cacheService.generateKey(CACHE_KEYS.REVIEWS_PRODUCT, productId);
    return cacheService.setWithTags(key, data, ['reviews', `product:${productId}`], ttl);
  },

  /**
   * Get cached reviews for a product
   */
  async getForProduct(productId) {
    const key = cacheService.generateKey(CACHE_KEYS.REVIEWS_PRODUCT, productId);
    return cacheService.get(key);
  },

  /**
   * Invalidate reviews for a product
   */
  async invalidateForProduct(productId) {
    const key = cacheService.generateKey(CACHE_KEYS.REVIEWS_PRODUCT, productId);
    return cacheService.delete(key);
  },

  /**
   * Invalidate all review caches
   */
  async invalidateAll() {
    return cacheService.invalidateTag('reviews');
  },
};

// =====================================================
// User-specific caching helpers
// =====================================================

export const userCache = {
  /**
   * Cache user profile
   */
  async setProfile(userId, data, ttl = CACHE_TTL.MEDIUM) {
    const key = cacheService.generateKey(CACHE_KEYS.USER_PROFILE, userId);
    return cacheService.set(key, data, ttl);
  },

  /**
   * Get cached user profile
   */
  async getProfile(userId) {
    const key = cacheService.generateKey(CACHE_KEYS.USER_PROFILE, userId);
    return cacheService.get(key);
  },

  /**
   * Cache user wishlist
   */
  async setWishlist(userId, data, ttl = CACHE_TTL.MEDIUM) {
    const key = cacheService.generateKey(CACHE_KEYS.USER_WISHLIST, userId);
    return cacheService.set(key, data, ttl);
  },

  /**
   * Get cached user wishlist
   */
  async getWishlist(userId) {
    const key = cacheService.generateKey(CACHE_KEYS.USER_WISHLIST, userId);
    return cacheService.get(key);
  },

  /**
   * Invalidate user cache
   */
  async invalidate(userId) {
    await cacheService.delete(cacheService.generateKey(CACHE_KEYS.USER_PROFILE, userId));
    await cacheService.delete(cacheService.generateKey(CACHE_KEYS.USER_WISHLIST, userId));
  },
};

// =====================================================
// Order-specific caching helpers
// =====================================================

export const orderCache = {
  /**
   * Cache order details
   */
  async setOrder(orderId, data, ttl = CACHE_TTL.SHORT) {
    const key = cacheService.generateKey(CACHE_KEYS.ORDER_DETAIL, orderId);
    return cacheService.set(key, data, ttl);
  },

  /**
   * Get cached order
   */
  async getOrder(orderId) {
    const key = cacheService.generateKey(CACHE_KEYS.ORDER_DETAIL, orderId);
    return cacheService.get(key);
  },

  /**
   * Cache user's orders
   */
  async setUserOrders(userId, data, ttl = CACHE_TTL.SHORT) {
    const key = cacheService.generateKey(CACHE_KEYS.ORDERS_USER, userId);
    return cacheService.set(key, data, ttl);
  },

  /**
   * Get cached user orders
   */
  async getUserOrders(userId) {
    const key = cacheService.generateKey(CACHE_KEYS.ORDERS_USER, userId);
    return cacheService.get(key);
  },

  /**
   * Invalidate order cache
   */
  async invalidate(orderId, userId) {
    await cacheService.delete(cacheService.generateKey(CACHE_KEYS.ORDER_DETAIL, orderId));
    if (userId) {
      await cacheService.delete(cacheService.generateKey(CACHE_KEYS.ORDERS_USER, userId));
    }
  },
};

// Export the service instance
export default cacheService;
