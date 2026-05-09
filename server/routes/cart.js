import express from 'express';
const router = express.Router();
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
  getRecoveryCart,
  recoverAbandonedCart
} from '../controllers/cartController.js';
import { isAuthenticatedUser, optionalAuth } from '../middleware/auth.js';

// Public routes for cart recovery (no auth required)
router.get('/recover/:token', getRecoveryCart);
router.post('/recover/:token', optionalAuth, recoverAbandonedCart);

// Protected routes (require authentication)
router.use(isAuthenticatedUser);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart);
router.delete('/clear', clearCart);
router.post('/merge', mergeCart);

export default router;
