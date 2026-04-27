import mongoose from 'mongoose';

const stockAlertSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: true
  },
  productSlug: {
    type: String,
    required: true
  },
  productImage: {
    type: String
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate subscriptions
stockAlertSchema.index({ email: 1, productId: 1 }, { unique: true });

// Index for querying unnotified alerts by product
stockAlertSchema.index({ productId: 1, notified: 1 });

// Static method to get subscribers for a product
stockAlertSchema.statics.getSubscribers = async function(productId) {
  return this.find({
    productId,
    notified: false
  }).select('email productName productSlug productImage');
};

// Static method to mark as notified
stockAlertSchema.statics.markAsNotified = async function(productId) {
  return this.updateMany(
    { productId, notified: false },
    { notified: true, notifiedAt: new Date() }
  );
};

// Static method to check if user is subscribed
stockAlertSchema.statics.isSubscribed = async function(email, productId) {
  const alert = await this.findOne({
    email: email.toLowerCase(),
    productId,
    notified: false
  });
  return !!alert;
};

const StockAlert = mongoose.model('StockAlert', stockAlertSchema);

export default StockAlert;
