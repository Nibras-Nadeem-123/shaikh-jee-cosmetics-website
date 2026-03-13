import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as validationMiddleware from '../middleware/validation.js';

const { createMockPayment, handleMockConfirmation } = paymentController;
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

// Initiate a mock payment request
router.post('/mock-payment', isAuthenticatedUser, mockPaymentValidation, handleValidationErrors, createMockPayment);

// Handle the mock confirmation (though for a simple mock, this might not be actively used)
router.post('/mock-confirm', handleMockConfirmation);

export default router;
