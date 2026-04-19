import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  shade: {
    name: String,
    color: String
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Abandoned cart recovery tracking
  abandonedCart: {
    isAbandoned: { type: Boolean, default: false },
    abandonedAt: { type: Date },
    remindersSent: { type: Number, default: 0 },
    lastReminderSent: { type: Date },
    recoveryToken: { type: String }, // For recovery link
    recovered: { type: Boolean, default: false },
    recoveredAt: { type: Date }
  }
}, {
  timestamps: true
});

// Index for faster queries
cartSchema.index({ userId: 1 });
cartSchema.index({ 'abandonedCart.isAbandoned': 1, 'abandonedCart.lastReminderSent': 1 });
cartSchema.index({ lastUpdated: 1 });

// Update lastUpdated on save
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find abandoned carts
cartSchema.statics.findAbandonedCarts = async function(hoursOld = 24, maxReminders = 3) {
  const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

  return this.find({
    'items.0': { $exists: true }, // Has at least one item
    lastUpdated: { $lt: cutoffDate },
    $or: [
      { 'abandonedCart.isAbandoned': false },
      {
        'abandonedCart.isAbandoned': true,
        'abandonedCart.remindersSent': { $lt: maxReminders },
        'abandonedCart.recovered': false
      }
    ]
  }).populate('userId', 'name email').populate('items.product');
};

// Method to mark cart as abandoned
cartSchema.methods.markAsAbandoned = async function() {
  const crypto = await import('crypto');
  this.abandonedCart.isAbandoned = true;
  this.abandonedCart.abandonedAt = new Date();
  this.abandonedCart.recoveryToken = crypto.randomBytes(32).toString('hex');
  await this.save();
  return this.abandonedCart.recoveryToken;
};

// Method to record reminder sent
cartSchema.methods.recordReminderSent = async function() {
  this.abandonedCart.remindersSent += 1;
  this.abandonedCart.lastReminderSent = new Date();
  await this.save();
};

// Method to mark as recovered
cartSchema.methods.markAsRecovered = async function() {
  this.abandonedCart.recovered = true;
  this.abandonedCart.recoveredAt = new Date();
  await this.save();
};

// Static method to find cart by recovery token
cartSchema.statics.findByRecoveryToken = async function(token) {
  return this.findOne({
    'abandonedCart.recoveryToken': token,
    'abandonedCart.recovered': false
  }).populate('items.product');
};

export default mongoose.model('Cart', cartSchema);
