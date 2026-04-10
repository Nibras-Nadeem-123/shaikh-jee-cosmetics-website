import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

// Get dashboard analytics
export const getDashboardAnalytics = catchAsyncErrors(async (req, res) => {
  const { period = '7days' } = req.query;
  
  let startDate = new Date();
  if (period === '7days') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === '30days') {
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === '90days') {
    startDate.setDate(startDate.getDate() - 90);
  }

  // Get orders in period
  const orders = await Order.find({
    createdAt: { $gte: startDate }
  }).populate('userId', 'name email');

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(o => o.userId?._id.toString())).size;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get product count
  const totalProducts = await Product.countDocuments();

  // Get top products
  const productSales = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const productId = item.productId?.toString() || item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          productId,
          name: item.name,
          sales: 0,
          revenue: 0
        };
      }
      productSales[productId].sales += item.quantity;
      productSales[productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Get category performance
  const categoryStats = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const category = item.category || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          sales: 0,
          revenue: 0
        };
      }
      categoryStats[category].sales += item.quantity;
      categoryStats[category].revenue += item.price * item.quantity;
    });
  });

  const categoryPerformance = Object.values(categoryStats)
    .sort((a, b) => b.revenue - a.revenue);

  // Get recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('userId', 'name email');

  res.status(200).json({
    success: true,
    analytics: {
      overview: {
        revenue: totalRevenue,
        orders: totalOrders,
        customers: uniqueCustomers,
        products: totalProducts,
        averageOrderValue
      },
      topProducts,
      categoryPerformance,
      recentOrders,
      period
    }
  });
});

// Get sales trend
export const getSalesTrend = catchAsyncErrors(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    trend: salesData
  });
});

// Update analytics (call after order creation)
export const updateAnalytics = async (order) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({ date: today });

    if (!analytics) {
      analytics = new Analytics({
        date: today,
        metrics: {
          revenue: 0,
          orders: 0,
          customers: 0,
          products: 0,
          averageOrderValue: 0
        },
        topProducts: [],
        categoryPerformance: []
      });
    }

    // Update metrics
    analytics.metrics.revenue += order.totalPrice;
    analytics.metrics.orders += 1;
    analytics.metrics.averageOrderValue = analytics.metrics.revenue / analytics.metrics.orders;

    await analytics.save();
  } catch (error) {
    console.error('Analytics update error:', error);
  }
};
