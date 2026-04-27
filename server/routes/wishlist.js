import express from 'express';
const router = express.Router();
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist
} from '../controllers/wishlistController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import { userCache, invalidateCache } from '../middleware/cache.js';
import { CACHE_TTL } from '../services/cacheService.js';

// All routes require authentication
router.use(isAuthenticatedUser);

// Get user's wishlist (user-specific cache)
router.get('/',
  userCache({ ttl: CACHE_TTL.SHORT, prefix: 'wishlist' }),
  getWishlist
);

// Add product to wishlist (invalidates user's wishlist cache)
router.post('/add',
  invalidateCache({
    custom: async (req, res, data, cacheService) => {
      const userId = req.user?._id;
      if (userId) {
        await cacheService.deletePattern(`user:${userId}:*wishlist*`);
      }
    }
  }),
  addToWishlist
);

// Remove product from wishlist
router.post('/remove',
  invalidateCache({
    custom: async (req, res, data, cacheService) => {
      const userId = req.user?._id;
      if (userId) {
        await cacheService.deletePattern(`user:${userId}:*wishlist*`);
      }
    }
  }),
  removeFromWishlist
);

// Check if product is in wishlist
router.get('/check/:productId', isInWishlist);

// Clear wishlist
router.delete('/clear',
  invalidateCache({
    custom: async (req, res, data, cacheService) => {
      const userId = req.user?._id;
      if (userId) {
        await cacheService.deletePattern(`user:${userId}:*wishlist*`);
      }
    }
  }),
  clearWishlist
);

export default router;
