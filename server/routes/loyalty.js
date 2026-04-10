import express from 'express';
const router = express.Router();
import {
  getLoyaltyPoints,
  redeemPoints,
  awardOrderPoints,
  getTierInfo,
  adjustPoints
} from '../controllers/loyaltyController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

// User routes
router.get('/points', isAuthenticatedUser, getLoyaltyPoints);
router.post('/redeem', isAuthenticatedUser, redeemPoints);
router.get('/tiers', getTierInfo);

// Order points (called internally after order completion)
router.post('/award', awardOrderPoints);

// Admin routes
router.post('/admin/adjust', isAuthenticatedUser, authorizeRoles('admin'), adjustPoints);

export default router;
