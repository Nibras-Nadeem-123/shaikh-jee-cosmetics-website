import express from 'express';
const router = express.Router();
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
  exportSubscribers
} from '../controllers/newsletterController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin routes
router.get('/admin/subscribers', isAuthenticatedUser, authorizeRoles('admin'), getSubscribers);
router.get('/admin/export', isAuthenticatedUser, authorizeRoles('admin'), exportSubscribers);

export default router;
