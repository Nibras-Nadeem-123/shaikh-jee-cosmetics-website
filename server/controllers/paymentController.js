import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';

/**
 * MOCK PAYMENT CONTROLLER
 * This is a simulated payment flow for development purposes.
 * It does not connect to any real payment gateway.
 */

// Simulate creating a payment request
export const createMockPayment = catchAsyncErrors(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    throw new ErrorHandler('Amount and Order ID are required for mock payment', 400);
  }

  // In a real scenario, you would save the order to the database here with a 'pending' status.
  console.log(`Mock payment initiated for Order ID: ${orderId} with amount: ${amount}`);

  // Simulate a successful payment immediately for development.
  // In a real gateway, you would redirect the user. Here, we just confirm success.
  res.status(200).json({
    success: true,
    message: 'Mock payment successful. Redirecting to confirmation page.',
    // You can define a confirmation URL for your frontend to redirect to.
    confirmationUrl: `/order-success?orderId=${orderId}&mock=true`
  });
});

// This function is for simulating a callback, though we are not using it in this simple mock.
export const handleMockConfirmation = catchAsyncErrors(async (req, res) => {
    console.log('Mock confirmation endpoint hit. In a real scenario, you would verify this callback.');
    res.status(200).send('Confirmation received.');
});

