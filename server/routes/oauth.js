import express from 'express';
const router = express.Router();
import {
  googleAuth,
  getGoogleAuthUrl,
  linkGoogleAccount,
  unlinkGoogleAccount
} from '../controllers/oauthController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

// Public routes
router.post('/google', googleAuth);
router.get('/google/url', getGoogleAuthUrl);

// Protected routes
router.post('/google/link', isAuthenticatedUser, linkGoogleAccount);
router.delete('/google/unlink', isAuthenticatedUser, unlinkGoogleAccount);

export default router;
