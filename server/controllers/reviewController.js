import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { clearCache } from '../config/redis.js';
import mongoose from 'mongoose'; // Hoisted from inside function

// Get all reviews for a product
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  if (!productId) {
    return next(new ErrorHandler('Product ID is required', 400));
  }

  // Try to convert to ObjectId, but fall back to string if invalid
  let productQuery;
  if (mongoose.Types.ObjectId.isValid(productId)) {
    productQuery = { productId: new mongoose.Types.ObjectId(productId) };
  } else {
    // If not a valid ObjectId, try matching as string
    productQuery = { productId };
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const reviews = await Review.find(productQuery)
    .populate('userId', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const totalReviews = await Review.countDocuments(productQuery);
  const totalPages = Math.ceil(totalReviews / limitNum);

  // Calculate average rating
  let ratingStats = [];
  if (mongoose.Types.ObjectId.isValid(productId)) {
    ratingStats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
  }

  res.status(200).json({
    success: true,
    reviews,
    totalReviews,
    totalPages,
    currentPage: pageNum,
    ratingStats: ratingStats[0] || { averageRating: 0, totalReviews: 0 }
  });
});

// Create a new review
export const createReview = catchAsyncErrors(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  // Convert productId to ObjectId
  const productObjectId = new mongoose.Types.ObjectId(productId);

  // Check if product exists
  const product = await Product.findById(productObjectId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if user already reviewed this product
  let existingReview = await Review.findOne({
    productId: productObjectId,
    userId: req.user._id
  });

  if (existingReview) {
    // Update the existing review instead of throwing an error
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.updatedAt = new Date();
    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: existingReview
    });
  }

  const review = new Review({
    productId: productObjectId,
    userId: req.user._id,
    userName: req.user.name,
    rating,
    comment,
    verified: true // Set to true if purchased
  });

  await review.save();

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    review
  });
});

// Update a review
export const updateReview = catchAsyncErrors(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  let review = await Review.findById(reviewId);
  if (!review) {
    throw new ErrorHandler('Review not found', 404);
  }

  // Check if user is the review owner
  if (review.userId.toString() !== req.user._id.toString()) {
    throw new ErrorHandler('You can only update your own reviews', 403);
  }

  review = await Review.findByIdAndUpdate(
    reviewId,
    { rating, comment, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  // Update product rating
  const ratings = await Review.aggregate([
    { $match: { productId: review.productId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (ratings.length > 0) {
    await Product.findByIdAndUpdate(review.productId, {
      rating: ratings[0].avgRating,
      reviewCount: ratings[0].count
    });
  }

  await clearCache(`/api/reviews*`);
  await clearCache(`/api/products*`);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review
  });
});

// Delete a review
export const deleteReview = catchAsyncErrors(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ErrorHandler('Review not found', 404);
  }

  // Check if user is the review owner or admin
  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ErrorHandler('You can only delete your own reviews', 403);
  }

  await Review.findByIdAndDelete(reviewId);

  // Update product rating
  const ratings = await Review.aggregate([
    { $match: { productId: review.productId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (ratings.length > 0) {
    await Product.findByIdAndUpdate(review.productId, {
      rating: ratings[0].avgRating,
      reviewCount: ratings[0].count
    });
  } else {
    await Product.findByIdAndUpdate(review.productId, {
      rating: 0,
      reviewCount: 0
    });
  }

  await clearCache(`/api/reviews*`);
  await clearCache(`/api/products*`);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// Mark review as helpful
export const markHelpful = catchAsyncErrors(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpful: 1 } },
    { new: true }
  );

  if (!review) {
    throw new ErrorHandler('Review not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Review marked as helpful',
    review
  });
});

// Admin: Get all reviews
export const getAllReviews = catchAsyncErrors(async (req, res) => {
  const reviews = await Review.find().populate('userId', 'name').populate('productId', 'name slug');

  res.status(200).json({
    success: true,
    reviews,
  });
});

