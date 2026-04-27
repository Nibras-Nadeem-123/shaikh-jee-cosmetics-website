/**
 * Redis Cache Middleware
 * Provides easy-to-use caching decorators for routes
 */

import cacheService, { CACHE_TTL } from '../services/cacheService.js';
import logger from '../utils/logger.js';

/**
 * Cache middleware for GET requests
 * Caches the response based on URL and query parameters
 *
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {string} options.prefix - Cache key prefix
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {string[]} options.tags - Tags for cache invalidation
 * @param {Function} options.condition - Function to determine if response should be cached
 */
export const cache = (options = {}) => {
  const {
    ttl = CACHE_TTL.MEDIUM,
    prefix = 'route',
    keyGenerator = null,
    tags = [],
    condition = () => true,
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis is not available
    if (!cacheService.isAvailable()) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : generateCacheKey(prefix, req);

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData !== null) {
        // Add cache header
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache miss - intercept response
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = async function (data) {
        // Check if we should cache this response
        const shouldCache = condition(req, res, data);

        if (shouldCache && res.statusCode >= 200 && res.statusCode < 300) {
          // Cache with or without tags
          if (tags.length > 0) {
            await cacheService.setWithTags(cacheKey, data, tags, ttl);
          } else {
            await cacheService.set(cacheKey, data, ttl);
          }
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Generate cache key from request
 */
const generateCacheKey = (prefix, req) => {
  const parts = [prefix, req.path];

  // Add sorted query parameters
  const queryKeys = Object.keys(req.query).sort();
  if (queryKeys.length > 0) {
    const queryString = queryKeys
      .map((key) => `${key}=${req.query[key]}`)
      .join('&');
    parts.push(queryString);
  }

  return parts.join(':').toLowerCase().replace(/\s+/g, '_');
};

/**
 * Cache invalidation middleware
 * Clears cache on data mutations (POST, PUT, PATCH, DELETE)
 *
 * @param {Object} options - Invalidation options
 * @param {string[]} options.tags - Tags to invalidate
 * @param {string[]} options.patterns - Key patterns to delete
 * @param {Function} options.custom - Custom invalidation function
 */
export const invalidateCache = (options = {}) => {
  const { tags = [], patterns = [], custom = null } = options;

  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after successful response
    res.json = async function (data) {
      // Only invalidate on successful mutations
      const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;

      if (isMutation && isSuccess && cacheService.isAvailable()) {
        try {
          // Invalidate tags
          for (const tag of tags) {
            await cacheService.invalidateTag(tag);
          }

          // Delete patterns
          for (const pattern of patterns) {
            await cacheService.deletePattern(pattern);
          }

          // Run custom invalidation
          if (custom) {
            await custom(req, res, data, cacheService);
          }

          logger.debug(`Cache invalidated: tags=[${tags.join(', ')}], patterns=[${patterns.join(', ')}]`);
        } catch (error) {
          logger.error('Cache invalidation error:', error);
        }
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear all cache for specific entity
 * Use this as a route handler or call directly
 */
export const clearEntityCache = async (entityType, entityId = null) => {
  if (!cacheService.isAvailable()) return;

  const patterns = {
    products: ['products:*'],
    reviews: ['reviews:*'],
    orders: ['orders:*'],
    users: ['users:*'],
    categories: ['categories:*'],
    all: ['*'],
  };

  const targetPatterns = patterns[entityType] || [];

  for (const pattern of targetPatterns) {
    await cacheService.deletePattern(pattern);
  }

  if (entityId) {
    await cacheService.invalidateTag(`${entityType}:${entityId}`);
  }
};

/**
 * Middleware to add cache control headers
 */
export const cacheControl = (options = {}) => {
  const {
    maxAge = 0,
    sMaxAge = null,
    isPrivate = false,
    noCache = false,
    noStore = false,
    mustRevalidate = false,
  } = options;

  return (req, res, next) => {
    const directives = [];

    if (noStore) {
      directives.push('no-store');
    } else if (noCache) {
      directives.push('no-cache');
    } else {
      directives.push(isPrivate ? 'private' : 'public');
      directives.push(`max-age=${maxAge}`);

      if (sMaxAge !== null) {
        directives.push(`s-maxage=${sMaxAge}`);
      }
    }

    if (mustRevalidate) {
      directives.push('must-revalidate');
    }

    res.set('Cache-Control', directives.join(', '));
    next();
  };
};

/**
 * Conditional caching - only cache if condition is met
 */
export const cacheIf = (conditionFn, options = {}) => {
  const cacheMiddleware = cache(options);

  return (req, res, next) => {
    if (conditionFn(req)) {
      return cacheMiddleware(req, res, next);
    }
    next();
  };
};

/**
 * User-aware cache - includes user ID in cache key
 * Useful for personalized responses
 */
export const userCache = (options = {}) => {
  return cache({
    ...options,
    keyGenerator: (req) => {
      const userId = req.user?._id || 'anonymous';
      const basePath = req.path.toLowerCase();
      const query = JSON.stringify(req.query);
      return `user:${userId}:${basePath}:${query}`;
    },
  });
};

/**
 * Cache warming - pre-populate cache
 */
export const warmCache = async (key, fetchFn, ttl = CACHE_TTL.LONG) => {
  if (!cacheService.isAvailable()) return null;

  try {
    const data = await fetchFn();
    await cacheService.set(key, data, ttl);
    logger.info(`Cache warmed: ${key}`);
    return data;
  } catch (error) {
    logger.error(`Cache warming failed: ${key}`, error);
    return null;
  }
};

export default {
  cache,
  invalidateCache,
  clearEntityCache,
  cacheControl,
  cacheIf,
  userCache,
  warmCache,
};
