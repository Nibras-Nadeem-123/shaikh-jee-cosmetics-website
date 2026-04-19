import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { signupValidation, loginValidation, handleValidationErrors } from '../middleware/validation.js';
import { setTokenCookie } from '../middleware/auth.js';
import { passwordResetLimiter } from '../middleware/rateLimiter.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
// bcrypt not needed here - User model pre-save hook handles password hashing

// Signup
router.post('/signup', signupValidation, handleValidationErrors, catchAsyncErrors(async (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    throw new ErrorHandler('User with this email already exists', 400);
  }
  
  user = await User.create({ name, email, password });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.status(201).json({ 
    success: true, 
    token, 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Login
router.post('/login', loginValidation, handleValidationErrors, catchAsyncErrors(async (req, res) => {
  const { email, password } = req.body;

  console.log(`Attempting login for email: ${email}`);
  const user = await User.findOne({ email }).select('+password');

  // Debug logging
  if (!user) {
    console.error(`Login failed: User not found for email: ${email}`);
    throw new ErrorHandler('Invalid email or password', 401);
  }

  console.log(`User found: ${user.email}, checking password...`);
  const isPasswordValid = await user.comparePassword(password);
  console.log(`Password valid: ${isPasswordValid}`);

  if (!isPasswordValid) {
    console.error(`Login failed: Invalid password for email: ${email}`);
    throw new ErrorHandler('Invalid email or password', 401);
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  setTokenCookie(res, token);
  res.status(200).json({ 
    success: true, 
    token, 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Password reset request handler
const handlePasswordResetRequest = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const message = `You are receiving this email because you (or someone else) requested a password reset.\n\nPlease click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Shaikh Jee Cosmetics" <noreply@shaikhjee.com>',
      to: user.email,
      subject: 'Password Reset Request - Shaikh Jee Cosmetics',
      text: message
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send password reset email. Please try again later.'
    });
  }
};

// Password reset request routes (rate limited to 3 requests per hour)
router.post('/password-reset', passwordResetLimiter, handlePasswordResetRequest);
router.post('/forgot-password', passwordResetLimiter, handlePasswordResetRequest); // Alias

// Reset password handler
const handleResetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Validate password
    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Set plain password - the pre-save hook will hash it
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to reset password. Please try again.'
    });
  }
};

// Reset password routes (both PUT and POST for flexibility)
router.put('/password-reset/:token', handleResetPassword);
router.post('/password-reset/:token', handleResetPassword);
router.put('/reset-password/:token', handleResetPassword); // Alias
router.post('/reset-password/:token', handleResetPassword); // Alias

// Email verification (rate limited to prevent abuse)
router.post('/verify-email', passwordResetLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const message = `Please verify your email by clicking the following link: \n\n ${verificationUrl}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Email Verification',
      text: message
    });

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify email token
router.get('/verify-email/:token', async (req, res) => {
  const emailVerificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CSRF token endpoint
router.get('/csrf-token', catchAsyncErrors(async (req, res) => {
  if (!req.csrfToken) {
    return res.status(500).json({ success: false, message: 'CSRF not initialized' });
  }

  res.status(200).json({
    success: true,
    csrfToken: req.csrfToken()
  });
}));

export default router;
