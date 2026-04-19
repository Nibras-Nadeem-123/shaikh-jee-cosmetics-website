import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, unique: true, sparse: true }, // Stock Keeping Unit
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
    hex: String,
    sku: String, // SKU per shade/variant
    quantity: { type: Number, default: 0 }
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  isNewProduct: { type: Boolean, default: false },
  brand: { type: String },
  featured: { type: Boolean, default: false },

  // Inventory Management
  inventory: {
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackInventory: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    reservedQuantity: { type: Number, default: 0 } // Reserved for pending orders
  },

  // SEO fields
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }]
  }
}, {
  timestamps: true
});

// Virtual for available quantity
productSchema.virtual('availableQuantity').get(function() {
  if (!this.inventory.trackInventory) return Infinity;
  return Math.max(0, this.inventory.quantity - this.inventory.reservedQuantity);
});

// Virtual to check if low stock
productSchema.virtual('isLowStock').get(function() {
  if (!this.inventory.trackInventory) return false;
  return this.inventory.quantity <= this.inventory.lowStockThreshold;
});

// Method to check if quantity is available
productSchema.methods.hasStock = function(quantity = 1, shadeId = null) {
  if (!this.inventory.trackInventory) return true;

  if (shadeId) {
    const shade = this.shades.id(shadeId);
    if (shade) {
      return shade.quantity >= quantity;
    }
  }

  return this.availableQuantity >= quantity;
};

// Method to reserve inventory (for checkout)
productSchema.methods.reserveStock = async function(quantity, shadeId = null) {
  if (!this.inventory.trackInventory) return true;

  if (shadeId) {
    const shade = this.shades.id(shadeId);
    if (shade && shade.quantity >= quantity) {
      shade.quantity -= quantity;
      await this.save();
      return true;
    }
    return false;
  }

  if (this.availableQuantity >= quantity) {
    this.inventory.reservedQuantity += quantity;
    await this.save();
    return true;
  }
  return false;
};

// Method to confirm stock deduction (after payment)
productSchema.methods.confirmStockDeduction = async function(quantity, shadeId = null) {
  if (!this.inventory.trackInventory) return true;

  if (!shadeId) {
    this.inventory.quantity -= quantity;
    this.inventory.reservedQuantity = Math.max(0, this.inventory.reservedQuantity - quantity);
  }

  // Update inStock status
  this.inStock = this.inventory.quantity > 0;
  await this.save();
  return true;
};

// Method to release reserved stock (cancelled order)
productSchema.methods.releaseReservedStock = async function(quantity, shadeId = null) {
  if (!this.inventory.trackInventory) return true;

  if (shadeId) {
    const shade = this.shades.id(shadeId);
    if (shade) {
      shade.quantity += quantity;
      await this.save();
      return true;
    }
    return false;
  }

  this.inventory.reservedQuantity = Math.max(0, this.inventory.reservedQuantity - quantity);
  await this.save();
  return true;
};

// Pre-save hook to auto-update inStock
productSchema.pre('save', function(next) {
  if (this.inventory.trackInventory) {
    this.inStock = this.inventory.quantity > 0 || this.inventory.allowBackorder;
  }
  next();
});

// Indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'inventory.quantity': 1 }); // For low stock queries
productSchema.index({ inStock: 1, featured: 1 }); // For featured in-stock products

// Include virtuals in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
