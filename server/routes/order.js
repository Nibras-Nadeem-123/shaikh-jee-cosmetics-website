import express from 'express';
const router = express.Router();
import { newOrder, myOrders, allOrders, updateOrder, getSingleOrder } from '../controllers/orderController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

router.post('/new', isAuthenticatedUser, newOrder);
router.get('/me', isAuthenticatedUser, myOrders);

// Admin Routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router.get('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleOrder); // New route for admin to get single order
router.put('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder);

export default router;
