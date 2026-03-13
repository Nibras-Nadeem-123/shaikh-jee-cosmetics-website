import express from 'express';
const router = express.Router();
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews // Import the new function
} from '../controllers/reviewController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Review validation rules
const createReviewValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

// Get all reviews for a product (public)
router.get('/product/:productId', getProductReviews);

// Create a review (authenticated)
router.post('/create', isAuthenticatedUser, createReviewValidation, handleValidationErrors, createReview);

// Update a review (authenticated, owner only)
router.put('/:reviewId', isAuthenticatedUser, createReviewValidation, handleValidationErrors, updateReview);

// Delete a review (authenticated, owner or admin)
router.delete('/:reviewId', isAuthenticatedUser, deleteReview);

// Mark review as helpful (public)
router.put('/:reviewId/helpful', markHelpful);

// Admin Routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllReviews); // New route for admin to get all reviews

export default router;
