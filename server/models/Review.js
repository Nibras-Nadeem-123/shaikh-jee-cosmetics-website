import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    minlength: 10,
    maxlength: 1000
  },
  verified: {
    type: Boolean,
    default: false // Verified purchase
  },
  helpful: {
    type: Number,
    default: 0
  },
  images: [{
    type: String,
    trim: true
  }],
  verified: {
    type: Boolean,
    default: false // Verified purchase
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  suppressReservedKeysWarning: true
});

// Index for faster queries
reviewSchema.index({ productId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
