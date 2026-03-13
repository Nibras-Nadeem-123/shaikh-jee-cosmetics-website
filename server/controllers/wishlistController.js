import User from '../models/User.js';
import Product from '../models/Product.js';
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
