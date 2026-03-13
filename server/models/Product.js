import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    default: 0.0
  },
  rating: {
    type: Number,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: [true, 'Please select category for this product']
  },
  subcategory: String,
  shades: [{
    id: String,
    name: String,
    color: String,
    stock: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  isNew: {
    type: Boolean,
    default: true
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  brand: String,
  featured: {
    type: Boolean,
    default: false
  },
  originalPrice: {
    type: Number
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  ingredients: String,
  usage: String,
  skinTypes: [{
    type: String
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  suppressReservedKeysWarning: true
});

// Index for faster queries
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 }); // Ensure only one index for slug
productSchema.index({ price: 1 });
productSchema.index({ user: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' }); // Full-text search index

// Compound indexes for common queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, isBestSeller: 1 });
productSchema.index({ subcategory: 1, category: 1 });

export default mongoose.model('Product', productSchema);
