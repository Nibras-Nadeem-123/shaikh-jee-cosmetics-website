import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number },
  image: { type: String },
  images: { type: [String] },
  description: { type: String, required: true },
  ingredients: { type: [String] },
  usage: { type: String },
  skinTypes: { type: [String] },
  shades: [{
    name: String,
    hex: String
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  brand: { type: String },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
