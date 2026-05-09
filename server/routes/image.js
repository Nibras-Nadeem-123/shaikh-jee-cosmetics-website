/**
 * Image Management Routes
 * Handles image uploads, optimization, and CDN operations
 */

import express from 'express';
import multer from 'multer';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { catchAsyncErrors } from '../middleware/errorHandler.js';
import cloudinaryService from '../services/cloudinaryService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, GIF, WebP`), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Max 10 files per request
  },
});

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Upload a single image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder name
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post(
  '/upload',
  isAuthenticatedUser,
  upload.single('image'),
  catchAsyncErrors(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    if (!cloudinaryService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Image upload service is not configured',
      });
    }

    const folder = req.body.folder || 'shaikhjee/products';

    const result = await cloudinaryService.uploadImage(req.file.buffer, {
      folder,
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
    });

    logger.info(`Image uploaded by user: ${req.user.email}, publicId: ${result.publicId}`);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: result,
    });
  })
);

/**
 * @swagger
 * /api/images/upload-multiple:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post(
  '/upload-multiple',
  isAuthenticatedUser,
  upload.array('images', 10),
  catchAsyncErrors(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    if (!cloudinaryService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Image upload service is not configured',
      });
    }

    const folder = req.body.folder || 'shaikhjee/products';

    const uploadPromises = req.files.map((file, index) =>
      cloudinaryService.uploadImage(file.buffer, {
        folder,
        public_id: `${Date.now()}-${index}-${file.originalname.split('.')[0]}`,
      })
    );

    const results = await Promise.all(uploadPromises);

    logger.info(`${results.length} images uploaded by user: ${req.user.email}`);

    res.json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      images: results,
    });
  })
);

/**
 * @swagger
 * /api/images/delete:
 *   delete:
 *     summary: Delete an image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete(
  '/delete',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    const result = await cloudinaryService.deleteImage(publicId);

    logger.info(`Image deleted by admin: ${req.user.email}, publicId: ${publicId}`);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      ...result,
    });
  })
);

/**
 * @swagger
 * /api/images/delete-multiple:
 *   delete:
 *     summary: Delete multiple images
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Images deleted successfully
 */
router.delete(
  '/delete-multiple',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  catchAsyncErrors(async (req, res) => {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of public IDs is required',
      });
    }

    const result = await cloudinaryService.deleteMultipleImages(publicIds);

    logger.info(`${publicIds.length} images deleted by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Images deleted successfully',
      ...result,
    });
  })
);

/**
 * @swagger
 * /api/images/optimize:
 *   post:
 *     summary: Get optimized URL for an image
 *     tags: [Images]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               width:
 *                 type: number
 *               height:
 *                 type: number
 *               quality:
 *                 type: string
 *     responses:
 *       200:
 *         description: Optimized URL generated
 */
router.post(
  '/optimize',
  catchAsyncErrors(async (req, res) => {
    const { url, width, height, quality, format } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required',
      });
    }

    const optimizedUrl = cloudinaryService.getCdnUrl(url, {
      width,
      height,
      quality,
      format,
    });

    const responsiveUrls = cloudinaryService.generateResponsiveUrls(url);

    res.json({
      success: true,
      original: url,
      optimized: optimizedUrl,
      responsive: responsiveUrls,
    });
  })
);

/**
 * @swagger
 * /api/images/info/{publicId}:
 *   get:
 *     summary: Get image information
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image information
 */
router.get(
  '/info/:publicId(*)',
  isAuthenticatedUser,
  catchAsyncErrors(async (req, res) => {
    const { publicId } = req.params;

    const info = await cloudinaryService.getImageInfo(publicId);

    res.json({
      success: true,
      ...info,
    });
  })
);

/**
 * @swagger
 * /api/images/status:
 *   get:
 *     summary: Check CDN service status
 *     tags: [Images]
 *     responses:
 *       200:
 *         description: CDN service status
 */
router.get(
  '/status',
  catchAsyncErrors(async (req, res) => {
    const isConfigured = cloudinaryService.isConfigured();

    res.json({
      success: true,
      configured: isConfigured,
      provider: 'cloudinary',
      message: isConfigured
        ? 'CDN service is configured and ready'
        : 'CDN service is not configured. Please set CLOUDINARY_* environment variables.',
    });
  })
);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files per request.',
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next(error);
});

export default router;
