import express from 'express';
const router = express.Router();
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews
} from '../controllers/reviewController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { CACHE_TTL } from '../services/cacheService.js';

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

// Get all reviews for a product (public, cached)
router.get('/product/:productId',
  cache({
    ttl: CACHE_TTL.MEDIUM,
    prefix: 'reviews:product',
    tags: ['reviews'],
    keyGenerator: (req) => `reviews:product:${req.params.productId}`
  }),
  getProductReviews
);

// Create a review (authenticated, rate limited, invalidates cache)
router.post('/create',
  isAuthenticatedUser,
  reviewLimiter,
  createReviewValidation,
  handleValidationErrors,
  invalidateCache({
    tags: ['reviews'],
    custom: async (req, res, data, cacheService) => {
      // Invalidate product-specific review cache
      if (req.body.productId) {
        await cacheService.delete(`reviews:product:${req.body.productId}`);
        // Also invalidate product cache as it may include rating
        await cacheService.invalidateTag(`product:${req.body.productId}`);
      }
    }
  }),
  createReview
);

// Update a review (authenticated, owner only, rate limited, invalidates cache)
router.put('/:reviewId',
  isAuthenticatedUser,
  reviewLimiter,
  createReviewValidation,
  handleValidationErrors,
  invalidateCache({ tags: ['reviews'] }),
  updateReview
);

// Delete a review (authenticated, owner or admin, invalidates cache)
router.delete('/:reviewId',
  isAuthenticatedUser,
  invalidateCache({ tags: ['reviews'] }),
  deleteReview
);

// Mark review as helpful (public, rate limited)
router.put('/:reviewId/helpful', reviewLimiter, markHelpful);

// Admin Routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllReviews);

export default router;
