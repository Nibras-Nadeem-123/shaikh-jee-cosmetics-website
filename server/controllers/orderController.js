import Order from '../models/Order.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { sendOrderEmail, sendCustomerOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/email.js';

// Create new order (Checkout Flow)
export const newOrder = catchAsyncErrors(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

  const order = await Order.create({
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    user: req.user._id
  });

  const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

  try {
    await sendOrderEmail(populatedOrder);
    console.log(`Admin order notification sent to ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}`);
  } catch (error) {
    console.error('Admin order email error:', error);
  }

  try {
    await sendCustomerOrderConfirmationEmail(populatedOrder);
    console.log(`Customer confirmation email sent to ${populatedOrder.shippingAddress.email}`);
  } catch (error) {
    console.error('Customer order confirmation email error:', error);
  }

  res.status(201).json({ success: true, order });
});

// Get current user orders (Account Page)
export const myOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json({ success: true, orders });
});

// Admin: Get all orders (Admin Dashboard)
export const allOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find();
  const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);
  res.status(200).json({ success: true, totalAmount, orders });
});

// Admin: Update order status
export const updateOrder = catchAsyncErrors(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ErrorHandler('Order not found', 404);
  }

  if (order.orderStatus === 'delivered') {
    throw new ErrorHandler('Order already delivered', 400);
  }

  const previousStatus = order.orderStatus;
  const newStatus = req.body.status;

  order.orderStatus = newStatus;
  if (newStatus === 'delivered') order.deliveredAt = Date.now();

  await order.save();

  // Send email notification to customer about status change
  if (previousStatus !== newStatus && order.shippingAddress?.email) {
    try {
      await sendOrderStatusUpdateEmail(order, newStatus);
      console.log(`Order status update email sent to ${order.shippingAddress.email} for order ${order.orderNumber || order._id}`);
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
      // Don't throw error - order update was successful, just email failed
    }
  }

  res.status(200).json({ success: true, message: `Order status updated to ${newStatus}` });
});

// Admin: Get single order details
export const getSingleOrder = catchAsyncErrors(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'name images');

  if (!order) {
    throw new ErrorHandler('Order not found with this ID', 404);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Public: Track order by order number or ID (no auth required)
export const trackOrder = catchAsyncErrors(async (req, res) => {
  const { orderNumber, email } = req.query;

  if (!orderNumber) {
    throw new ErrorHandler('Order number is required', 400);
  }

  // Try to find by orderNumber first, then by _id
  let order = await Order.findOne({ orderNumber: orderNumber });

  // If not found by orderNumber, try finding by _id (for orders tracked by ID)
  if (!order) {
    // Check if the orderNumber looks like a MongoDB ObjectId or partial ID
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderNumber);
    if (isValidObjectId) {
      order = await Order.findById(orderNumber);
    } else {
      // Try matching partial order ID (last 8 characters)
      const orders = await Order.find();
      order = orders.find(o =>
        o._id.toString().slice(-8).toUpperCase() === orderNumber.replace('ORD-', '').toUpperCase() ||
        o.orderNumber?.toUpperCase() === orderNumber.toUpperCase()
      );
    }
  }

  if (!order) {
    throw new ErrorHandler('Order not found. Please check your order number.', 404);
  }

  // Optional email verification for extra security
  if (email && order.shippingAddress?.email?.toLowerCase() !== email.toLowerCase()) {
    throw new ErrorHandler('Email does not match the order. Please verify your details.', 400);
  }

  // Return order with limited info for security (no user ID, etc.)
  const trackingInfo = {
    _id: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    statusHistory: order.statusHistory,
    orderItems: order.orderItems,
    shippingAddress: {
      name: order.shippingAddress.name,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
    },
    itemsPrice: order.itemsPrice,
    shippingPrice: order.shippingPrice,
    totalPrice: order.totalPrice,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    deliveredAt: order.deliveredAt,
    shipping: order.shipping,
  };

  res.status(200).json({
    success: true,
    order: trackingInfo,
  });
});
