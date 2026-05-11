import mongoose from 'mongoose';

// Cloudinary image schema for storing image metadata
const cloudinaryImageSchema = new mongoose.Schema({
  publicId: { type: String, required: true },
  url: { type: String, required: true },
  secureUrl: { type: String },
  width: { type: Number },
  height: { type: Number },
  format: { type: String },
  bytes: { type: Number },
  alt: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, unique: true, sparse: true }, // Stock Keeping Unit
  category: { type: String, required: true },
  subcategory: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number },
  // Legacy string fields for backward compatibility
  image: { type: String },
  images: { type: [String] },
  // New Cloudinary image documents
  cloudinaryImages: [cloudinaryImageSchema],
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

// Virtual for primary image URL (from Cloudinary or legacy)
productSchema.virtual('primaryImageUrl').get(function() {
  // First try to get from cloudinaryImages
  if (this.cloudinaryImages && this.cloudinaryImages.length > 0) {
    const primary = this.cloudinaryImages.find(img => img.isPrimary);
    return primary ? primary.url : this.cloudinaryImages[0].url;
  }
  // Fallback to legacy image field
  return this.image || (this.images && this.images[0]) || null;
});

// Virtual for all image URLs (combining Cloudinary and legacy)
productSchema.virtual('allImageUrls').get(function() {
  const urls = [];
  // Add Cloudinary images first
  if (this.cloudinaryImages && this.cloudinaryImages.length > 0) {
    urls.push(...this.cloudinaryImages.map(img => img.url));
  }
  // Add legacy images if no Cloudinary images
  if (urls.length === 0) {
    if (this.image) urls.push(this.image);
    if (this.images && this.images.length > 0) {
      urls.push(...this.images.filter(img => img !== this.image));
    }
  }
  return urls;
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

// Method to add a Cloudinary image
productSchema.methods.addCloudinaryImage = async function(imageData, setAsPrimary = false) {
  const newImage = {
    publicId: imageData.publicId,
    url: imageData.url,
    secureUrl: imageData.secureUrl || imageData.url,
    width: imageData.width,
    height: imageData.height,
    format: imageData.format,
    bytes: imageData.bytes,
    alt: imageData.alt || this.name,
    isPrimary: setAsPrimary || this.cloudinaryImages.length === 0
  };

  // If setting as primary, unset other primary images
  if (newImage.isPrimary) {
    this.cloudinaryImages.forEach(img => {
      img.isPrimary = false;
    });
  }

  this.cloudinaryImages.push(newImage);

  // Also update legacy image field for backward compatibility
  if (newImage.isPrimary) {
    this.image = newImage.url;
  }
  if (!this.images) this.images = [];
  this.images.push(newImage.url);

  await this.save();
  return newImage;
};

// Method to remove a Cloudinary image by publicId
productSchema.methods.removeCloudinaryImage = async function(publicId) {
  const imageIndex = this.cloudinaryImages.findIndex(img => img.publicId === publicId);

  if (imageIndex === -1) return false;

  const removedImage = this.cloudinaryImages[imageIndex];
  this.cloudinaryImages.splice(imageIndex, 1);

  // If removed image was primary, set new primary
  if (removedImage.isPrimary && this.cloudinaryImages.length > 0) {
    this.cloudinaryImages[0].isPrimary = true;
    this.image = this.cloudinaryImages[0].url;
  }

  // Update legacy images array
  this.images = this.images.filter(url => url !== removedImage.url);
  if (this.image === removedImage.url) {
    this.image = this.cloudinaryImages[0]?.url || this.images[0] || '';
  }

  await this.save();
  return removedImage;
};

// Method to set primary image
productSchema.methods.setPrimaryImage = async function(publicId) {
  const image = this.cloudinaryImages.find(img => img.publicId === publicId);

  if (!image) return false;

  this.cloudinaryImages.forEach(img => {
    img.isPrimary = img.publicId === publicId;
  });

  // Update legacy image field
  this.image = image.url;

  await this.save();
  return true;
};

// Method to get all public IDs (useful for cleanup)
productSchema.methods.getAllCloudinaryPublicIds = function() {
  return this.cloudinaryImages.map(img => img.publicId);
};

// Pre-save hook to auto-generate slug and update inStock
productSchema.pre('save', function(next) {
  // Auto-generate slug from name if not provided or empty
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }

  // Auto-update inStock based on inventory
  if (this.inventory.trackInventory) {
    this.inStock = this.inventory.quantity > 0 || this.inventory.allowBackorder;
  }
  next();
});

// Indexes for better query performance
// Note: slug and sku already have unique indexes from schema definition
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
