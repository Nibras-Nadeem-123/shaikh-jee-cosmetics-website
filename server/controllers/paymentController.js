import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import LoyaltyPoint from '../models/LoyaltyPoint.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';
import { updateAnalytics } from '../controllers/analyticsController.js';
import { checkAndAlertLowStock } from '../utils/lowStockService.js';
import { processReferralRewards } from '../controllers/referralController.js';

// Initialize Razorpay instance
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// Create Razorpay order
export const createRazorpayOrder = catchAsyncErrors(async (req, res, next) => {
  const { amount, orderId, currency = 'PKR' } = req.body;

  if (!amount || !orderId) {
    return next(new ErrorHandler('Amount and orderId are required', 400));
  }

  const razorpayInstance = getRazorpayInstance();

  if (!razorpayInstance) {
    return next(new ErrorHandler('Razorpay is not configured. Please contact support.', 500));
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${orderId}`,
      notes: {
        order_id: orderId,
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return next(new ErrorHandler('Failed to create payment order', 500));
  }
});

// Verify Razorpay payment signature (client-side verification)
export const verifyRazorpayPayment = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return next(new ErrorHandler('Missing payment verification details', 400));
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return next(new ErrorHandler('Payment verification not configured', 500));
  }

  // Create the expected signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    return next(new ErrorHandler('Payment verification failed', 400));
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
    id: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    status: 'captured'
  };
  await order.save();

  // Deduct stock for each order item and check for low stock
  try {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product && product.inventory?.trackInventory) {
        await product.confirmStockDeduction(item.quantity, item.shade?._id);

        const updatedProduct = await Product.findById(item.product);
        if (updatedProduct) {
          await checkAndAlertLowStock(updatedProduct);
        }
      }
    }
    console.log(`Stock deducted for order ${order.orderNumber}`);
  } catch (stockError) {
    console.error('Stock deduction error:', stockError);
  }

  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail({
      userName: order.shippingAddress.name,
      userEmail: order.shippingAddress.email || order.user?.email,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt
    });
    console.log(`Order confirmation email sent to ${order.shippingAddress.email || order.user?.email}`);
  } catch (error) {
    console.error('Email send error:', error);
  }

  // Process referral rewards if applicable
  try {
    if (order.user?._id) {
      const referralResult = await processReferralRewards(
        order.user._id,
        order._id,
        order.totalPrice
      );
      if (referralResult.success) {
        console.log(`Referral rewards processed for order ${order.orderNumber}`);
      }
    }
  } catch (error) {
    console.error('Referral rewards error:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    order
  });
});

// Get Razorpay key (for frontend)
export const getRazorpayKey = catchAsyncErrors(async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;

  if (!keyId) {
    return res.status(200).json({
      success: false,
      configured: false,
      message: 'Razorpay is not configured'
    });
  }

  res.status(200).json({
    success: true,
    configured: true,
    keyId
  });
});

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

  // Deduct stock for each order item and check for low stock
  try {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product && product.inventory?.trackInventory) {
        await product.confirmStockDeduction(item.quantity, item.shade?._id);

        const updatedProduct = await Product.findById(item.product);
        if (updatedProduct) {
          await checkAndAlertLowStock(updatedProduct);
        }
      }
    }
    console.log(`Stock deducted for order ${order.orderNumber}`);
  } catch (stockError) {
    console.error('Stock deduction error:', stockError);
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

  // Process referral rewards if applicable
  try {
    if (order.user?._id) {
      const referralResult = await processReferralRewards(
        order.user._id,
        order._id,
        order.totalPrice
      );
      if (referralResult.success) {
        console.log(`Referral rewards processed for order ${order.orderNumber}`);
      }
    }
  } catch (error) {
    console.error('Referral rewards error:', error);
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

      // Deduct stock for each order item and check for low stock
      try {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product && product.inventory?.trackInventory) {
            // Deduct stock
            await product.confirmStockDeduction(item.quantity, item.shade?._id);

            // Check and alert if low stock
            const updatedProduct = await Product.findById(item.product);
            if (updatedProduct) {
              await checkAndAlertLowStock(updatedProduct);
            }
          }
        }
        console.log(`Stock deducted for order ${order.orderNumber}`);
      } catch (stockError) {
        console.error('Stock deduction error:', stockError);
        // Don't fail the webhook, just log the error
      }

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
          
          // Calculate points (1 point per Rs.10, multiplied by tier)
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

      // Process referral rewards if applicable
      try {
        if (order.userId?._id) {
          const referralResult = await processReferralRewards(
            order.userId._id,
            order._id,
            order.totalPrice
          );
          if (referralResult.success) {
            console.log(`Referral rewards processed for order ${order.orderNumber}`);
          }
        }
      } catch (error) {
        console.error('Referral rewards error:', error);
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
