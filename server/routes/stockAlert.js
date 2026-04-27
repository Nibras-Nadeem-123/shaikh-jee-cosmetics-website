import express from 'express';
import StockAlert from '../models/StockAlert.js';
import Product from '../models/Product.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Subscribe to stock alert
router.post('/subscribe', async (req, res) => {
  try {
    const { email, productId } = req.body;

    if (!email || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Email and product ID are required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is already in stock
    if (product.quantity > 0 || product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently in stock'
      });
    }

    // Check if already subscribed
    const existingAlert = await StockAlert.findOne({
      email: email.toLowerCase(),
      productId,
      notified: false
    });

    if (existingAlert) {
      return res.status(400).json({
        success: false,
        message: 'You are already subscribed to alerts for this product'
      });
    }

    // Create stock alert
    const stockAlert = await StockAlert.create({
      email: email.toLowerCase(),
      productId,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0] || product.image,
      userId: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'You will be notified when this product is back in stock',
      data: stockAlert
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You are already subscribed to alerts for this product'
      });
    }

    console.error('Stock alert subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to stock alerts'
    });
  }
});

// Unsubscribe from stock alert
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { email, productId } = req.body;

    if (!email || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Email and product ID are required'
      });
    }

    const result = await StockAlert.deleteOne({
      email: email.toLowerCase(),
      productId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from stock alerts'
    });
  } catch (error) {
    console.error('Stock alert unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from stock alerts'
    });
  }
});

// Check subscription status
router.get('/check/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.json({
        success: true,
        isSubscribed: false
      });
    }

    const isSubscribed = await StockAlert.isSubscribed(email, productId);

    res.json({
      success: true,
      isSubscribed
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription status'
    });
  }
});

// Get all alerts for a product (admin only)
router.get('/product/:productId', isAuthenticatedUser, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    const alerts = await StockAlert.find({ productId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Get product alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Get alert statistics (admin only)
router.get('/stats', isAuthenticatedUser, isAdmin, async (req, res) => {
  try {
    const totalAlerts = await StockAlert.countDocuments();
    const pendingAlerts = await StockAlert.countDocuments({ notified: false });
    const notifiedAlerts = await StockAlert.countDocuments({ notified: true });

    // Get top products with most alerts
    const topProducts = await StockAlert.aggregate([
      { $match: { notified: false } },
      { $group: { _id: '$productId', productName: { $first: '$productName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        totalAlerts,
        pendingAlerts,
        notifiedAlerts,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert statistics'
    });
  }
});

export default router;
