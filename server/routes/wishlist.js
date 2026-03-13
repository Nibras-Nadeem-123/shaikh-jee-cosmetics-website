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

// All routes require authentication
router.use(isAuthenticatedUser);

// Get user's wishlist
router.get('/', getWishlist);

// Add product to wishlist
router.post('/add', addToWishlist);

// Remove product from wishlist
router.post('/remove', removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:productId', isInWishlist);

// Clear wishlist
router.delete('/clear', clearWishlist);

export default router;
