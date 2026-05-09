import express from 'express';
const router = express.Router();
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist,
  createSharedWishlist,
  getSharedWishlist,
  getMySharedWishlists,
  updateSharedWishlist,
  deleteSharedWishlist
} from '../controllers/wishlistController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import { userCache, invalidateCache, cache } from '../middleware/cache.js';
import { CACHE_TTL } from '../services/cacheService.js';

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Get a shared wishlist by shareId (PUBLIC)
router.get('/shared/:shareId',
  cache({ ttl: CACHE_TTL.SHORT, prefix: 'shared-wishlist', tags: ['wishlist'] }),
  getSharedWishlist
);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Apply authentication to all routes below
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

// ============================================
// SHARED WISHLIST ROUTES (Protected)
// ============================================

// Create a shareable wishlist
router.post('/share', createSharedWishlist);

// Get all shared wishlists created by current user
router.get('/shared', getMySharedWishlists);

// Update a shared wishlist
router.put('/shared/:shareId', updateSharedWishlist);

// Delete a shared wishlist
router.delete('/shared/:shareId', deleteSharedWishlist);

export default router;
