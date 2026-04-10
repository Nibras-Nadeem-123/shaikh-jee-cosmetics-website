import crypto from 'crypto';
import Order from '../models/Order.js';
import LoyaltyPoint from '../models/LoyaltyPoint.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';
import { updateAnalytics } from '../controllers/analyticsController.js';

// Create mock payment (for testing)
export const createMockPayment = catchAsyncErrors(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    return res.status(400).json({
      success: false,
      message: 'Amount and orderId are required'
    });
  }

  // Generate mock payment ID
  const paymentId = 'pay_' + crypto.randomBytes(16).toString('hex');

  res.status(200).json({
    success: true,
    paymentId,
    orderId,
    amount,
    status: 'pending',
    message: 'Mock payment created. Call /mock-confirm to confirm.'
  });
});

// Handle mock payment confirmation
export const handleMockConfirmation = catchAsyncErrors(async (req, res, next) => {
  const { orderId, paymentId } = req.body;

  if (!orderId || !paymentId) {
    return res.status(400).json({
      success: false,
      message: 'orderId and paymentId are required'
    });
  }

  // Find and update order
  const order = await Order.findById(orderId).populate('user', 'name email');

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Update order status
  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  order.paymentInfo = {
    id: paymentId,
    status: 'captured'
  };
  await order.save();

  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail({
      userName: order.shippingAddress.name,
      userEmail: order.shippingAddress.email || order.user.email,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt
    });
    console.log(`Order confirmation email sent to ${order.shippingAddress.email || order.user.email}`);
  } catch (error) {
    console.error('Email send error:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Payment confirmed successfully',
    order
  });
});

// Verify Razorpay webhook signature
const verifyWebhookSignature = (body, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET not configured');
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return expectedSignature === signature;
};

// Razorpay webhook handler
export const handleRazorpayWebhook = catchAsyncErrors(async (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (!signature) {
    return next(new ErrorHandler('Missing webhook signature', 400));
  }
  
  // Verify signature
  if (!verifyWebhookSignature(req.body, signature)) {
    return next(new ErrorHandler('Invalid webhook signature', 401));
  }
  
  const event = req.body;
  const payload = event.payload;
  
  switch (event.event) {
    case 'payment.captured': {
      const payment = payload.payment.entity;
      const orderId = payment.notes.order_id;
      
      if (!orderId) {
        return next(new ErrorHandler('Order ID not found in payment notes', 400));
      }
      
      // Find and update order
      const order = await Order.findById(orderId).populate('userId');
      
      if (!order) {
        return next(new ErrorHandler('Order not found', 404));
      }
      
      // Update order status
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      order.paymentId = payment.id;
      await order.save();
      
      // Award loyalty points
      if (order.userId) {
        try {
          let loyalty = await LoyaltyPoint.findOne({ userId: order.userId._id });
          
          if (!loyalty) {
            loyalty = await LoyaltyPoint.create({
              userId: order.userId._id,
              points: 0,
              tier: 'bronze',
              lifetimePoints: 0,
              redeemedPoints: 0
            });
          }
          
          // Calculate points (1 point per ₹10, multiplied by tier)
          const basePoints = Math.floor(order.totalPrice / 10);
          const tierMultipliers = {
            bronze: 1,
            silver: 1.25,
            gold: 1.5,
            platinum: 2
          };
          
          const points = Math.floor(basePoints * tierMultipliers[loyalty.tier]);
          
          loyalty.addPoints(points, `Order #${order.orderNumber}`, order._id);
          await loyalty.save();
          
          console.log(`Awarded ${points} points to user ${order.userId.email}`);
        } catch (error) {
          console.error('Loyalty points error:', error);
        }
      }
      
      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail({
          userName: order.shippingAddress.name,
          userEmail: order.shippingAddress.email || order.user.email,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          paymentMethod: order.paymentMethod,
          orderItems: order.orderItems,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt
        });
        console.log(`Order confirmation email sent to ${order.shippingAddress.email || order.user.email}`);
      } catch (error) {
        console.error('Email send error:', error);
      }
      
      // Update analytics
      try {
        await updateAnalytics(order);
      } catch (error) {
        console.error('Analytics update error:', error);
      }
      
      break;
    }
    
    case 'payment.failed': {
      const payment = payload.payment.entity;
      const orderId = payment.notes.order_id;
      
      if (orderId) {
        const order = await Order.findById(orderId);
        
        if (order) {
          order.paymentStatus = 'failed';
          order.orderStatus = 'cancelled';
          order.paymentId = payment.id;
          await order.save();
          
          console.log(`Order ${order.orderNumber} payment failed`);
        }
      }
      
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.event}`);
  }
  
  // Acknowledge webhook
  res.status(200).json({
    success: true,
    message: 'Webhook received successfully'
  });
});
