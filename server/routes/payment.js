import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as validationMiddleware from '../middleware/validation.js';

const {
  createMockPayment,
  handleMockConfirmation,
  handleRazorpayWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey
} = paymentController;
const { handleValidationErrors } = validationMiddleware;

// Validation rules for mock payment
const mockPaymentValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a valid number greater than or equal to 1'),
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
];

// Validation rules for Razorpay order
const razorpayOrderValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a valid number greater than or equal to 1'),
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
];

// Validation rules for Razorpay payment verification
const razorpayVerifyValidation = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
];

// Get Razorpay key (public - for frontend)
router.get('/razorpay-key', getRazorpayKey);

// Create Razorpay order
router.post('/razorpay-order', isAuthenticatedUser, razorpayOrderValidation, handleValidationErrors, createRazorpayOrder);

// Verify Razorpay payment
router.post('/razorpay-verify', isAuthenticatedUser, razorpayVerifyValidation, handleValidationErrors, verifyRazorpayPayment);

// Initiate a mock payment request (for testing)
router.post('/mock-payment', isAuthenticatedUser, mockPaymentValidation, handleValidationErrors, createMockPayment);

// Handle the mock confirmation
router.post('/mock-confirm', handleMockConfirmation);

// Razorpay webhook - separate route to avoid middleware conflicts
router.post('/razorpay-webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Manually parse the body for webhook
  try {
    req.body = JSON.parse(req.body.toString());
    handleRazorpayWebhook(req, res, next);
  } catch (error) {
    console.error('Webhook parse error:', error);
    res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  }
});

export default router;
