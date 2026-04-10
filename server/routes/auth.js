import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { signupValidation, loginValidation, handleValidationErrors } from '../middleware/validation.js';
import { setTokenCookie } from '../middleware/auth.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

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
  
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
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

// Password reset request
router.post('/password-reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/password-reset/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const message = `You are receiving this email because you (or someone else) requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message
    });

    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset password
router.put('/password-reset/:token', async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Email verification
router.post('/verify-email', async (req, res) => {
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
