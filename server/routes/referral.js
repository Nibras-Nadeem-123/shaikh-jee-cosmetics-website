import express from 'express';
import {
  getMyReferralCode,
  getReferralStats,
  validateReferralCode,
  getRefereeDiscount,
  calculateReferralDiscount,
  getAdminReferralStats,
  updateReferralRewards
} from '../controllers/referralController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const validateCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Referral code is required')
    .isLength({ min: 4, max: 20 })
    .withMessage('Invalid referral code format')
];

const calculateDiscountValidation = [
  body('orderAmount')
    .isNumeric()
    .withMessage('Order amount must be a number')
    .custom(value => value > 0)
    .withMessage('Order amount must be greater than 0')
];

// ==================
// Public Routes
// ==================

/**
 * @swagger
 * /api/referral/validate:
 *   post:
 *     summary: Validate a referral code
 *     tags: [Referral]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: The referral code to validate
 *     responses:
 *       200:
 *         description: Code validation result
 */
router.post('/validate', validateCodeValidation, handleValidationErrors, validateReferralCode);

// ==================
// Authenticated User Routes
// ==================

/**
 * @swagger
 * /api/referral/code:
 *   get:
 *     summary: Get or create user's referral code
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's referral code and share URL
 */
router.get('/code', isAuthenticatedUser, getMyReferralCode);

/**
 * @swagger
 * /api/referral/stats:
 *   get:
 *     summary: Get user's referral statistics and history
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral statistics and referral history
 */
router.get('/stats', isAuthenticatedUser, getReferralStats);

/**
 * @swagger
 * /api/referral/discount:
 *   get:
 *     summary: Check if user has a referral discount available
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral discount status
 */
router.get('/discount', isAuthenticatedUser, getRefereeDiscount);

/**
 * @swagger
 * /api/referral/calculate-discount:
 *   post:
 *     summary: Calculate referral discount for an order
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderAmount
 *             properties:
 *               orderAmount:
 *                 type: number
 *                 description: The order subtotal
 *     responses:
 *       200:
 *         description: Calculated discount amount
 */
router.post(
  '/calculate-discount',
  isAuthenticatedUser,
  calculateDiscountValidation,
  handleValidationErrors,
  calculateReferralDiscount
);

// ==================
// Admin Routes
// ==================

/**
 * @swagger
 * /api/referral/admin/stats:
 *   get:
 *     summary: Get overall referral program statistics (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Program-wide referral statistics
 */
router.get('/admin/stats', isAuthenticatedUser, authorizeRoles('admin'), getAdminReferralStats);

/**
 * @swagger
 * /api/referral/admin/rewards:
 *   put:
 *     summary: Update referral reward configuration (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referrerBonus:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [points, discount, percentage]
 *                   value:
 *                     type: number
 *               refereeBonus:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [points, discount, percentage]
 *                   value:
 *                     type: number
 *     responses:
 *       200:
 *         description: Rewards updated successfully
 */
router.put('/admin/rewards', isAuthenticatedUser, authorizeRoles('admin'), updateReferralRewards);

export default router;
