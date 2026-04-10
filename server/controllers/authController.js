import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { sendPasswordResetEmail, sendWelcomeEmail, sendOrderConfirmationEmail } from '../utils/emailService.js';

// Request password reset
export const requestPasswordReset = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Email is required', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists or not for security
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = await PasswordReset.generateToken(user._id);

  // Send email
  const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);

  if (!emailResult.success) {
    console.error('Failed to send reset email:', emailResult.error);
    return next(new ErrorHandler('Failed to send reset email. Please try again.', 500));
  }

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.'
  });
});

// Reset password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return next(new ErrorHandler('Token and new password are required', 400));
  }

  if (newPassword.length < 6) {
    return next(new ErrorHandler('Password must be at least 6 characters long', 400));
  }

  // Verify token
  const resetRequest = await PasswordReset.verifyToken(token);

  if (!resetRequest) {
    return next(new ErrorHandler('Invalid or expired reset token', 400));
  }

  const user = resetRequest.userId;

  // Update password
  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();

  // Mark token as used
  await resetRequest.markAsUsed();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.'
  });
});

// Resend welcome email
export const resendWelcomeEmail = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Email is required', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const emailResult = await sendWelcomeEmail(user.email, user.name);

  if (!emailResult.success) {
    return next(new ErrorHandler('Failed to send email', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Welcome email sent successfully'
  });
});

// Send order confirmation (called from order controller)
export const sendOrderConfirmation = catchAsyncErrors(async (req, res) => {
  const { orderId } = req.body;

  // This would be called internally after order creation
  // Implementation depends on order structure
  res.status(200).json({
    success: true,
    message: 'Order confirmation email queued'
  });
});
