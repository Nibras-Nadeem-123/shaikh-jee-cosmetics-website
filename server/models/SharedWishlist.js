import mongoose from 'mongoose';
import crypto from 'crypto';

const sharedWishlistSchema = new mongoose.Schema({
  // Unique shareable ID (short, URL-friendly)
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Owner of the wishlist
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // Snapshot of products at time of sharing
  products: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],

  // Optional title for the shared wishlist
  title: {
    type: String,
    default: 'My Wishlist',
    maxlength: 100
  },

  // Optional description/message
  message: {
    type: String,
    maxlength: 500
  },

  // Privacy settings
  isPublic: {
    type: Boolean,
    default: true
  },

  // Statistics
  viewCount: {
    type: Number,
    default: 0
  },

  // Expiration (optional - null means never expires)
  expiresAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique share ID before saving
sharedWishlistSchema.pre('save', function(next) {
  if (!this.shareId) {
    // Generate a short, URL-friendly ID (8 characters)
    this.shareId = crypto.randomBytes(4).toString('hex');
  }
  this.updatedAt = new Date();
  next();
});

// Check if wishlist has expired
sharedWishlistSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Increment view count
sharedWishlistSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  await this.save();
};

// Index for efficient queries
sharedWishlistSchema.index({ user: 1, createdAt: -1 });
sharedWishlistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SharedWishlist', sharedWishlistSchema);
