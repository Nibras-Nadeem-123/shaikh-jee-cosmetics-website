import express from 'express';
const router = express.Router();
import {
  requestPasswordReset,
  resetPassword,
  resendWelcomeEmail
} from '../controllers/authController.js';
import { passwordResetLimiter } from '../middleware/rateLimiter.js';

// Public routes with rate limiting
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/resend-welcome', resendWelcomeEmail);

// sendOrderConfirmation removed - not exported from authController

export default router;
