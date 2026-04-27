/**
 * Cache Management Routes (Admin Only)
 * Provides API endpoints for cache monitoring and management
 */

import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { catchAsyncErrors } from '../middleware/errorHandler.js';
import cacheService from '../services/cacheService.js';
import { clearEntityCache } from '../middleware/cache.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics
 */
router.get(
  '/stats',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const stats = cacheService.getStats();
    const info = await cacheService.getInfo();

    res.json({
      success: true,
      available: cacheService.isAvailable(),
      stats,
      info,
    });
  })
);

/**
 * @swagger
 * /api/admin/cache/keys:
 *   get:
 *     summary: List cache keys
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pattern
 *         schema:
 *           type: string
 *         description: Key pattern (default: *)
 *     responses:
 *       200:
 *         description: List of cache keys
 */
router.get(
  '/keys',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const pattern = req.query.pattern || '*';
    const keys = await cacheService.keys(pattern);

    // Get TTL for each key
    const keysWithTTL = await Promise.all(
      keys.slice(0, 100).map(async (key) => ({
        key,
        ttl: await cacheService.getTTL(key),
      }))
    );

    res.json({
      success: true,
      total: keys.length,
      showing: keysWithTTL.length,
      keys: keysWithTTL,
    });
  })
);

/**
 * @swagger
 * /api/admin/cache/key/{key}:
 *   get:
 *     summary: Get cached value by key
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cached value
 */
router.get(
  '/key/:key(*)',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { key } = req.params;
    const value = await cacheService.get(key);
    const ttl = await cacheService.getTTL(key);

    if (value === null) {
      return res.status(404).json({
        success: false,
        message: 'Key not found',
      });
    }

    res.json({
      success: true,
      key,
      ttl,
      value,
    });
  })
);

/**
 * @swagger
 * /api/admin/cache/key/{key}:
 *   delete:
 *     summary: Delete a cache key
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Key deleted
 */
router.delete(
  '/key/:key(*)',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { key } = req.params;

    logger.info(`Cache key deleted by admin: ${req.user.email}, key: ${key}`);

    await cacheService.delete(key);

    res.json({
      success: true,
      message: 'Key deleted',
      key,
    });
  })
);

/**
 * @swagger
 * /api/admin/cache/pattern:
 *   delete:
 *     summary: Delete keys by pattern
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern:
 *                 type: string
 *     responses:
 *       200:
 *         description: Keys deleted
 */
router.delete(
  '/pattern',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { pattern } = req.body;

    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern is required',
      });
    }

    logger.info(`Cache pattern deleted by admin: ${req.user.email}, pattern: ${pattern}`);

    const count = await cacheService.deletePattern(pattern);

    res.json({
      success: true,
      message: `Deleted ${count} keys`,
      pattern,
      deletedCount: count,
    });
  })
);

/**
 * @swagger
 * /api/admin/cache/invalidate:
 *   post:
 *     summary: Invalidate cache by tag or entity
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *               entity:
 *                 type: string
 *                 enum: [products, reviews, orders, users, categories, all]
 *               entityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cache invalidated
 */
router.post(
  '/invalidate',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { tag, entity, entityId } = req.body;

    logger.info(`Cache invalidation by admin: ${req.user.email}`, { tag, entity, entityId });

    let count = 0;

    if (tag) {
      count = await cacheService.invalidateTag(tag);
    } else if (entity) {
      await clearEntityCache(entity, entityId);
      count = -1; // Unknown count for entity clearing
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either tag or entity is required',
      });
    }

    res.json({
      success: true,
      message: 'Cache invalidated',
      invalidated: { tag, entity, entityId },
      keysAffected: count >= 0 ? count : 'unknown',
    });
  })
);

/**
 * @swagger
 * /api/admin/cache/flush:
 *   post:
 *     summary: Flush all cache (use with caution!)
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirm:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cache flushed
 */
router.post(
  '/flush',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm flush by setting confirm: true',
      });
    }

    logger.warn(`Cache FLUSH initiated by admin: ${req.user.email}`);

    await cacheService.flushAll();

    res.json({
      success: true,
      message: 'All cache flushed',
    });
  })
);

/**
 * @swagger
 * /api/admin/cache/stats/reset:
 *   post:
 *     summary: Reset cache statistics
 *     tags: [Admin - Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats reset
 */
router.post(
  '/stats/reset',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    cacheService.resetStats();

    res.json({
      success: true,
      message: 'Cache statistics reset',
    });
  })
);

export default router;
