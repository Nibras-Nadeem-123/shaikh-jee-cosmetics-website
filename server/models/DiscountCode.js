import mongoose from 'mongoose';

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please enter discount code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: [true, 'Please enter discount value']
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number
  },
  maxUsageCount: {
    type: Number
  },
  currentUsageCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validTill: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
discountCodeSchema.index({ validFrom: 1, validTill: 1 });
discountCodeSchema.index({ isActive: 1 });

export default mongoose.model('DiscountCode', discountCodeSchema);
