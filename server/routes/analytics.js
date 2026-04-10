import express from 'express';
const router = express.Router();
import {
  getDashboardAnalytics,
  getSalesTrend
} from '../controllers/analyticsController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

// Admin only routes
router.get('/dashboard', isAuthenticatedUser, authorizeRoles('admin'), getDashboardAnalytics);
router.get('/sales-trend', isAuthenticatedUser, authorizeRoles('admin'), getSalesTrend);

export default router;
