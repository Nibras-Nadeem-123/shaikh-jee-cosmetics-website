import express from 'express';
const router = express.Router();
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
} from '../controllers/cartController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

// All cart routes require authentication
router.use(isAuthenticatedUser);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart);
router.delete('/clear', clearCart);
router.post('/merge', mergeCart);

export default router;
