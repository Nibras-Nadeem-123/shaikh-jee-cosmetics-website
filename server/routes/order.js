import express from 'express';
const router = express.Router();
import { newOrder, myOrders, allOrders, updateOrder, getSingleOrder, trackOrder } from '../controllers/orderController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import Order from '../models/Order.js';
import { generateInvoicePDF, getInvoiceFilename } from '../utils/invoiceGenerator.js';

// Public route - Track order (no auth required)
router.get('/track', trackOrder);

router.post('/new', isAuthenticatedUser, newOrder);
router.get('/me', isAuthenticatedUser, myOrders);

// Download invoice PDF
router.get('/:id/invoice', isAuthenticatedUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order);
    const filename = getInvoiceFilename(order);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
});

// Admin Routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router.get('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleOrder); // New route for admin to get single order
router.put('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder);

export default router;
