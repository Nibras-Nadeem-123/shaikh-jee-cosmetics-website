"use client"
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Truck, RefreshCw, Shield, Loader2, ThumbsUp, Filter } from 'lucide-react';
import { Product, Shade, Review } from '../types';
import { useApp } from '@/contexts/AppContext';
import { apiService } from '@/services/api';
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface ProductDetailsPageProps {
  product: Product;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
}) => {
  const router = useRouter();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist, user } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);
  const { showToast } = useToast();
  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    product.shades?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews'>(
    'description'
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());


  // Fetch reviews dynamically
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product._id) return;

      setReviewsLoading(true);
      try {
        const data = await apiService.getReviewsByProductId(product._id);
        console.log('Reviews fetched:', data);
        if (data && data.reviews) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        // Don't show toast for network errors, just log them
        if ((error as Error).message.includes('connect')) {
          console.warn('Backend not available - reviews will be unavailable');
        } else {
          showToast("Failed to fetch reviews.", "error");
        }
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, product._id]);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  // Sort reviews based on selected sort option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return (b.helpful || 0) - (a.helpful || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulReviews.has(reviewId)) return; // Already marked helpful

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}/helpful`;
      await fetch(endpoint, { method: 'PUT' });

      // Update local state
      setReviews(prev => prev.map(r =>
        r._id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
      ));
      setHelpfulReviews(prev => new Set(prev).add(reviewId));
      showToast("Thanks for your feedback!", "success");
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedShade);
    showToast("Added to cart!", "success");
  };

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    name: ''
  });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      showToast("Please login to submit a review", "error");
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Use correct API URL format
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/create`;

      console.log('Submitting review to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      console.log('Response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text().catch(() => 'Unable to read response');
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server error. Please ensure backend is running on port 5000.');
      }

      const data = await response.json();
      console.log('Review response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      showToast(data.message === 'Review updated successfully' ? 'Review updated successfully!' : 'Review submitted successfully!', 'success');

      // Add the review immediately to the list (optimistic update)
      if (data.review) {
        // Ensure the review has all necessary fields for display
        const newReview = {
          ...data.review,
          userName: data.review.userName || user?.name || 'Anonymous',
          verified: data.review.verified || false,
          helpful: data.review.helpful || 0
        };

        // Check if this is an update (review already exists in the list)
        const existingReviewIndex = reviews.findIndex(r => r._id === newReview._id);
        if (existingReviewIndex >= 0) {
          // Update existing review
          setReviews(prev => prev.map(r => r._id === newReview._id ? newReview : r));
        } else {
          // Add new review at the beginning
          setReviews(prev => [newReview, ...prev]);
        }
      }

      // Switch to reviews tab to show the submitted review
      setActiveTab('reviews');

      // Reset form
      setReviewForm({ rating: 5, comment: '', name: '' });

      // Also fetch fresh reviews in background to ensure consistency
      setTimeout(async () => {
        try {
          const reviewsData = await apiService.getReviewsByProductId(product._id);
          if (reviewsData && reviewsData.reviews) {
            setReviews(reviewsData.reviews);
          }
        } catch (err) {
          console.error('Failed to refresh reviews:', err);
        }
      }, 500);
    } catch (error) {
      console.error("Review submission error:", error);
      const errorMessage = (error as Error).message || "Failed to submit review. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product._id)) { // Changed product.id to product._id
      removeFromWishlist(product._id); // Changed product.id to product._id
    } else {
      addToWishlist(product);
    }
  };

  const onNavigate = (path: string) => {
    window.location.href = `/${path}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <button onClick={() => onNavigate('')} className="hover:text-primary">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('shop')} className="hover:text-primary">
            Shop
          </button>
          <span>/</span>
          <span className="text-gray-500">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 gap-12 mb-16 lg:grid-cols-2">
          {/* Images */}
          <div>
            <div className="mb-4 overflow-hidden bg-gray-100 rounded-lg aspect-square">
              <Image
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.name}
                height={600}
                width={600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect fill='%23f3f4f6' width='600' height='600'/%3E%3C/svg%3E"
                className="object-cover w-full h-full"
                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
              />
            </div>
            {(product.images && product.images.length > 1) && (
              <div className="flex gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-1 aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent'
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      height={150}
                      width={150}
                      sizes="150px"
                      className="object-cover w-full h-full"
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="mb-4">
              <p className="mb-2 text-gray-500">{product.category}</p>
              <h1 className="mb-4 text-3xl md:text-4xl">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="px-3 py-1 text-white bg-red-500 rounded-full">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Shades */}
            {product.shades && product.shades.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3">
                  Select Shade: {selectedShade?.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.shades.map((shade) => (
                    <button
                      key={shade._id}
                      onClick={() => setSelectedShade(shade)}
                      className={`w-12 h-12 rounded-full border-2 ${selectedShade?._id === shade._id
                        ? 'border-primary scale-110'
                        : 'border-gray-300'
                        } transition-transform`}
                      style={{ backgroundColor: shade.color }}
                      title={shade.name}
                    />))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 transition-colors hover:bg-secondary"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-gray-200 border-x">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 transition-colors hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
                {product.inStock ? (
                  <span className="text-green-500">In Stock</span>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex items-center justify-center flex-1 gap-2 py-3 text-white transition-colors rounded-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleToggleWishlist}
                className="px-6 py-3 transition-colors border-2 rounded-full border-primary hover:bg-secondary"
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''
                    }`}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 p-4 bg-gray-100 rounded-lg md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-500">Above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Easy Returns</p>
                  <p className="text-xs text-gray-500">7 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">100% Authentic</p>
                  <p className="text-xs text-gray-500">Guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex gap-8 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 ${activeTab === 'description'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
                }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-4 ${activeTab === 'ingredients'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
                }`}
            >
              Ingredients & Usage
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 ${activeTab === 'reviews'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
                }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'description' && (
              <div>
                <p className="mb-4 text-gray-500">{product.description}</p>
                {product.skinTypes && (
                  <div>
                    <h4 className="mb-2">Suitable for:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.skinTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm rounded-full bg-secondary"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                {product.ingredients && (
                  <div className="mb-6">
                    <h4 className="mb-2">Ingredients</h4>
                    <p className="text-gray-500">{product.ingredients}</p>
                  </div>
                )}
                {product.usage && (
                  <div>
                    <h4 className="mb-2">How to Use</h4>
                    <p className="text-gray-500">{product.usage}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Review Form */}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="p-8 mb-10 border bg-secondary/30 rounded-2xl border-primary/20">
                    <h3 className="mb-6 text-lg font-bold text-foreground">Share Your Experience</h3>
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Rating */}
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="text-2xl transition-transform hover:scale-125"
                            >
                              <Star
                                className={reviewForm.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Your Review</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          rows={4}
                          required
                          placeholder="Share your thoughts about this product..."
                          className="w-full px-4 py-3 transition-all bg-white border border-gray-200 resize-none rounded-xl focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!reviewForm.comment.trim()}
                      className="w-full py-4 font-bold text-white transition-all rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="p-8 mb-10 text-center border bg-secondary/30 rounded-2xl border-primary/20">
                    <Star size={48} className="mx-auto mb-4 text-primary" />
                    <h3 className="mb-2 text-xl font-bold text-foreground">Share Your Experience</h3>
                    <p className="mb-6 text-muted-foreground">Login to submit a review for this product</p>
                    <button
                      onClick={() => router.push('/login')}
                      className="px-8 py-3 font-bold text-white transition-all rounded-full bg-primary hover:bg-primary/90"
                    >
                      Login to Review
                    </button>
                  </div>
                )}

                {/* Reviews Summary */}
                <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/30 rounded-2xl border border-primary/10">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Average Rating */}
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">{averageRating}</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating))
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">Based on {reviews.length} reviews</div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 w-full">
                      <div className="space-y-2">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-16">
                              <span className="text-sm font-medium">{rating}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-foreground">Customer Reviews ({reviews.length})</h4>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-4 py-2 text-sm bg-secondary/50 border border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-secondary/80 transition-all"
                    >
                      <option value="newest">Newest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary" size={40} />
                  </div>
                ) : sortedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {sortedReviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-6 bg-secondary/30 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            {/* User Avatar Placeholder */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-secondary flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                              {(review.userName || review.user?.name || 'A').charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-semibold text-foreground">
                                  {review.userName || (typeof review.userId === 'object' ? review.userId.name : '') || (review.user?.name) || 'Anonymous'}
                                  {user && (review.userId === user._id || review.user?._id === user._id) && (
                                    <span className="text-primary ml-1">(You)</span>
                                  )}
                                </span>
                                {review.verified && (
                                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span>•</span>
                                <span>
                                  {typeof review.createdAt === 'string'
                                    ? new Date(review.createdAt).toLocaleDateString()
                                    : new Date(review.createdAt).toLocaleDateString()
                                }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-foreground/80 mb-4 leading-relaxed">{review.comment}</p>

                        {/* Helpful Button */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleHelpfulClick(review._id)}
                            disabled={helpfulReviews.has(review._id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                              helpfulReviews.has(review._id)
                                ? 'bg-primary text-white'
                                : 'bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${helpfulReviews.has(review._id) ? 'fill-white' : ''}`} />
                            <span>Helpful</span>
                            {(review.helpful || 0) > 0 && (
                              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                helpfulReviews.has(review._id)
                                  ? 'bg-white/20'
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {review.helpful || 0}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-secondary/30 rounded-2xl border border-primary/10">
                    <Star size={56} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h4 className="text-xl font-bold text-foreground mb-2">No Reviews Yet</h4>
                    <p className="text-muted-foreground mb-6">Be the first to review this product and help others!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
