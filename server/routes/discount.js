import express from 'express';
const router = express.Router();
import * as discountController from '../controllers/discountController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as validationMiddleware from '../middleware/validation.js';

const { createDiscountCode, validateDiscountCode, getAllDiscountCodes, updateDiscountCode, deleteDiscountCode, getSingleDiscountCode } = discountController;
const { handleValidationErrors } = validationMiddleware;

// Validation rules
const discountCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Discount code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Code must be between 3 and 20 characters'),
  body('discountType')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('validFrom')
    .isISO8601()
    .withMessage('Valid From must be a valid date'),
  body('validTill')
    .isISO8601()
    .withMessage('Valid Till must be a valid date')
];

// Public route - validate code
router.post('/validate', validateDiscountCode);

// Admin only routes
router.use(isAuthenticatedUser, authorizeRoles('admin'));

// Create discount code
router.post('/create', discountCodeValidation, handleValidationErrors, createDiscountCode);

// Get all discount codes
router.get('/', getAllDiscountCodes);

// Get single discount code
router.get('/:id', getSingleDiscountCode);

// Update discount code
router.put('/:codeId', updateDiscountCode);

// Delete discount code
router.delete('/:codeId', deleteDiscountCode);

export default router;
