/**
 * Backup Management Routes (Admin Only)
 * Provides API endpoints for database backup operations
 */

import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { catchAsyncErrors } from '../middleware/errorHandler.js';
import {
  createBackup,
  restoreBackup,
  listBackups,
  deleteBackup,
  cleanupOldBackups,
} from '../utils/backup.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/backups:
 *   get:
 *     summary: List all database backups
 *     tags: [Admin - Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of backups
 */
router.get(
  '/',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const backups = listBackups();

    res.json({
      success: true,
      count: backups.length,
      backups,
    });
  })
);

/**
 * @swagger
 * /api/admin/backups:
 *   post:
 *     summary: Create a new database backup
 *     tags: [Admin - Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Backup created successfully
 */
router.post(
  '/',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    logger.info(`Backup initiated by admin: ${req.user.email}`);

    const result = await createBackup({
      prefix: 'manual',
    });

    res.status(201).json({
      success: true,
      message: 'Backup created successfully',
      backup: result,
    });
  })
);

/**
 * @swagger
 * /api/admin/backups/{name}:
 *   delete:
 *     summary: Delete a specific backup
 *     tags: [Admin - Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup deleted successfully
 */
router.delete(
  '/:name',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { name } = req.params;

    logger.info(`Backup deletion initiated by admin: ${req.user.email}, backup: ${name}`);

    const result = deleteBackup(name);

    res.json({
      success: true,
      message: 'Backup deleted successfully',
      ...result,
    });
  })
);

/**
 * @swagger
 * /api/admin/backups/{name}/restore:
 *   post:
 *     summary: Restore database from a backup
 *     tags: [Admin - Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drop:
 *                 type: boolean
 *                 description: Drop existing collections before restore
 *     responses:
 *       200:
 *         description: Restore completed successfully
 */
router.post(
  '/:name/restore',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { name } = req.params;
    const { drop = false } = req.body;

    logger.warn(`Database restore initiated by admin: ${req.user.email}, backup: ${name}, drop: ${drop}`);

    const result = await restoreBackup(name, { drop });

    res.json({
      success: true,
      message: 'Database restored successfully',
      ...result,
    });
  })
);

/**
 * @swagger
 * /api/admin/backups/cleanup:
 *   post:
 *     summary: Clean up old backups
 *     tags: [Admin - Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed
 */
router.post(
  '/cleanup',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    logger.info(`Backup cleanup initiated by admin: ${req.user.email}`);

    const deleted = await cleanupOldBackups();

    res.json({
      success: true,
      message: `Cleaned up ${deleted} old backup(s)`,
      deletedCount: deleted,
    });
  })
);

export default router;
