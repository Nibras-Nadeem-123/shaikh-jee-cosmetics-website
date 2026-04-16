import Order from '../models/Order.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { sendOrderEmail, sendCustomerOrderConfirmationEmail } from '../utils/email.js';

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

  order.orderStatus = req.body.status;
  if (req.body.status === 'delivered') order.deliveredAt = Date.now();

  await order.save();
  res.status(200).json({ success: true });
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
