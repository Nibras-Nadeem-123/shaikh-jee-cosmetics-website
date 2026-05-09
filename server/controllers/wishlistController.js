import User from '../models/User.js';
import Product from '../models/Product.js';
import SharedWishlist from '../models/SharedWishlist.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';

// Get user's wishlist
export const getWishlist = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');

  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  res.status(200).json({
    success: true,
    wishlist: user.wishlist,
    count: user.wishlist.length
  });
});

// Add product to wishlist
export const addToWishlist = catchAsyncErrors(async (req, res) => {
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Check if product already in wishlist
  if (user.wishlist.includes(productId)) {
    return res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      wishlist: user.wishlist
    });
  }

  // Add to wishlist
  user.wishlist.push(productId);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    wishlist: updatedUser.wishlist,
    count: updatedUser.wishlist.length
  });
});

// Remove product from wishlist
export const removeFromWishlist = catchAsyncErrors(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Remove from wishlist
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    wishlist: updatedUser.wishlist,
    count: updatedUser.wishlist.length
  });
});

// Check if product is in wishlist
export const isInWishlist = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  const inWishlist = user.wishlist.includes(productId);

  res.status(200).json({
    success: true,
    inWishlist
  });
});

// Clear wishlist
export const clearWishlist = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  user.wishlist = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared',
    wishlist: [],
    count: 0
  });
});

// ============================================
// SHARED WISHLIST FUNCTIONS
// ============================================

// Create a shareable wishlist link
export const createSharedWishlist = catchAsyncErrors(async (req, res) => {
  const { title, message, expiresInDays } = req.body;

  const user = await User.findById(req.user._id).populate('wishlist');
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  if (user.wishlist.length === 0) {
    throw new ErrorHandler('Your wishlist is empty', 400);
  }

  // Calculate expiration date if specified
  let expiresAt = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Create shared wishlist with current products
  const sharedWishlist = await SharedWishlist.create({
    user: req.user._id,
    products: user.wishlist.map(p => p._id),
    title: title || `${user.name}'s Wishlist`,
    message: message || '',
    expiresAt
  });

  // Populate products for response
  await sharedWishlist.populate('products');

  res.status(201).json({
    success: true,
    message: 'Wishlist shared successfully',
    sharedWishlist: {
      shareId: sharedWishlist.shareId,
      title: sharedWishlist.title,
      message: sharedWishlist.message,
      productCount: sharedWishlist.products.length,
      expiresAt: sharedWishlist.expiresAt,
      createdAt: sharedWishlist.createdAt
    }
  });
});

// Get a shared wishlist by shareId (PUBLIC - no auth required)
export const getSharedWishlist = catchAsyncErrors(async (req, res) => {
  const { shareId } = req.params;

  const sharedWishlist = await SharedWishlist.findOne({ shareId })
    .populate('products')
    .populate('user', 'name');

  if (!sharedWishlist) {
    throw new ErrorHandler('Shared wishlist not found', 404);
  }

  // Check if expired
  if (sharedWishlist.isExpired()) {
    throw new ErrorHandler('This shared wishlist has expired', 410);
  }

  // Increment view count (don't await to avoid slowing response)
  SharedWishlist.findByIdAndUpdate(sharedWishlist._id, { $inc: { viewCount: 1 } }).exec();

  res.status(200).json({
    success: true,
    sharedWishlist: {
      shareId: sharedWishlist.shareId,
      title: sharedWishlist.title,
      message: sharedWishlist.message,
      ownerName: sharedWishlist.user?.name || 'Anonymous',
      products: sharedWishlist.products,
      productCount: sharedWishlist.products.length,
      viewCount: sharedWishlist.viewCount + 1,
      createdAt: sharedWishlist.createdAt,
      expiresAt: sharedWishlist.expiresAt
    }
  });
});

// Get all shared wishlists created by current user
export const getMySharedWishlists = catchAsyncErrors(async (req, res) => {
  const sharedWishlists = await SharedWishlist.find({ user: req.user._id })
    .populate('products', 'name images price')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sharedWishlists.length,
    sharedWishlists: sharedWishlists.map(sw => ({
      shareId: sw.shareId,
      title: sw.title,
      message: sw.message,
      productCount: sw.products.length,
      products: sw.products.slice(0, 4), // Preview of first 4 products
      viewCount: sw.viewCount,
      createdAt: sw.createdAt,
      expiresAt: sw.expiresAt,
      isExpired: sw.isExpired()
    }))
  });
});

// Update a shared wishlist
export const updateSharedWishlist = catchAsyncErrors(async (req, res) => {
  const { shareId } = req.params;
  const { title, message, refreshProducts } = req.body;

  const sharedWishlist = await SharedWishlist.findOne({
    shareId,
    user: req.user._id
  });

  if (!sharedWishlist) {
    throw new ErrorHandler('Shared wishlist not found or you do not have permission', 404);
  }

  // Update fields
  if (title) sharedWishlist.title = title;
  if (message !== undefined) sharedWishlist.message = message;

  // Optionally refresh products from current wishlist
  if (refreshProducts) {
    const user = await User.findById(req.user._id);
    sharedWishlist.products = user.wishlist;
  }

  await sharedWishlist.save();
  await sharedWishlist.populate('products', 'name images price');

  res.status(200).json({
    success: true,
    message: 'Shared wishlist updated',
    sharedWishlist: {
      shareId: sharedWishlist.shareId,
      title: sharedWishlist.title,
      message: sharedWishlist.message,
      productCount: sharedWishlist.products.length,
      updatedAt: sharedWishlist.updatedAt
    }
  });
});

// Delete a shared wishlist
export const deleteSharedWishlist = catchAsyncErrors(async (req, res) => {
  const { shareId } = req.params;

  const sharedWishlist = await SharedWishlist.findOneAndDelete({
    shareId,
    user: req.user._id
  });

  if (!sharedWishlist) {
    throw new ErrorHandler('Shared wishlist not found or you do not have permission', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Shared wishlist deleted'
  });
});
