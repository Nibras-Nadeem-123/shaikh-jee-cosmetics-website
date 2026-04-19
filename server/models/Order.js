import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  shippingAddress: {
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    selectedShade: {
      id: String,
      name: String,
      color: String
    }
  }],
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Digital'],
    default: 'COD'
  },
  paymentInfo: {
    id: String,
    status: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Shipping & Tracking
  shipping: {
    carrier: { type: String }, // e.g., "Delhivery", "BlueDart", "DTDC"
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    shippedAt: { type: Date },
    estimatedDelivery: { type: Date },
    actualWeight: { type: Number }, // in grams
    packageDimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },

  // Order Timeline/History
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
    },
    timestamp: { type: Date, default: Date.now },
    location: { type: String },
    description: { type: String },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
  }],

  // Customer Notes
  customerNotes: { type: String, maxlength: 500 },
  adminNotes: { type: String, maxlength: 1000 },

  // Cancellation/Return
  cancellation: {
    reason: { type: String },
    requestedAt: { type: Date },
    processedAt: { type: Date },
    refundStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    },
    refundAmount: { type: Number }
  },

  // Discount applied
  discount: {
    code: { type: String },
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number },
    amount: { type: Number } // Actual discount amount
  }
});

// Compound indexes for better query performance
orderSchema.index({ user: 1, orderStatus: 1 }); // Find user orders by status
orderSchema.index({ user: 1, createdAt: -1 }); // User's orders sorted by date
orderSchema.index({ orderStatus: 1, createdAt: -1 }); // Admin: orders by status
orderSchema.index({ createdAt: -1 }); // Sorting by date
orderSchema.index({ 'paymentInfo.status': 1 }); // Payment status queries

// Pre-save hook to generate order number and track status changes
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Generate unique order number
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }

  // Track status changes
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      description: getStatusDescription(this.orderStatus)
    });

    // Update timestamps based on status
    if (this.orderStatus === 'shipped' && !this.shipping?.shippedAt) {
      this.shipping = this.shipping || {};
      this.shipping.shippedAt = new Date();
    }
    if (this.orderStatus === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
  }

  next();
});

// Helper function for status descriptions
function getStatusDescription(status) {
  const descriptions = {
    pending: 'Order placed, awaiting confirmation',
    confirmed: 'Order confirmed by seller',
    processing: 'Order is being prepared',
    shipped: 'Order has been shipped',
    out_for_delivery: 'Order is out for delivery',
    delivered: 'Order has been delivered',
    cancelled: 'Order has been cancelled',
    returned: 'Order has been returned'
  };
  return descriptions[status] || 'Status updated';
}

// Method to update order status with tracking
orderSchema.methods.updateStatus = async function(newStatus, options = {}) {
  const { location, description, updatedBy } = options;

  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    location,
    description: description || getStatusDescription(newStatus),
    updatedBy
  });

  await this.save();
  return this;
};

// Method to add tracking info
orderSchema.methods.addTrackingInfo = async function(trackingInfo) {
  this.shipping = {
    ...this.shipping,
    ...trackingInfo
  };
  await this.save();
  return this;
};

// Method to cancel order
orderSchema.methods.cancelOrder = async function(reason, userId) {
  this.orderStatus = 'cancelled';
  this.cancellation = {
    reason,
    requestedAt: new Date(),
    processedAt: new Date(),
    refundStatus: this.paymentMethod === 'Digital' ? 'pending' : undefined
  };
  this.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    description: `Order cancelled: ${reason}`,
    updatedBy: userId
  });
  await this.save();
  return this;
};

// Virtual for current tracking status
orderSchema.virtual('currentTrackingStatus').get(function() {
  if (this.statusHistory && this.statusHistory.length > 0) {
    return this.statusHistory[this.statusHistory.length - 1];
  }
  return null;
});

// Include virtuals in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.model('Order', orderSchema);
