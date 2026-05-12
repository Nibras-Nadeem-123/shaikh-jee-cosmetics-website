"use client"
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Truck, RefreshCw, Shield, Loader2, ThumbsUp, Filter, Camera, X, HelpCircle, ChevronRight, Sparkles, Check, Minus, Plus, Package } from 'lucide-react';
import { Product, Shade, Review } from '../types';
import { useApp } from '@/contexts/AppContext';
import { apiService } from '@/services/api';
import { getCSRFToken } from '@/utils/csrf';
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';
import { useRouter, usePathname } from 'next/navigation';
import { SocialShareButtons } from './SocialShareButtons';
import { BackInStockAlert } from './BackInStockAlert';
import { ProductRecommendations } from './ProductRecommendations';
import { ShadeGuide } from './ShadeGuide';
import Link from 'next/link';

interface ProductDetailsPageProps {
  product: Product;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist, user } = useApp();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shaikh-jee-cosmetics-website.vercel.app';
  const productUrl = `${siteUrl}${pathname}`;
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
  const [isShadeGuideOpen, setIsShadeGuideOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product._id) return;

      setReviewsLoading(true);
      try {
        const data = await apiService.getReviewsByProductId(product._id);
        if (data && data.reviews) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
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

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

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
    if (helpfulReviews.has(reviewId)) return;

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}/helpful`;
      await fetch(endpoint, { method: 'PUT' });

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
    setIsAddingToCart(true);
    addToCart(product, quantity, selectedShade);

    setTimeout(() => {
      setIsAddingToCart(false);
      setJustAdded(true);
      showToast("Added to cart!", "success");
      setTimeout(() => setJustAdded(false), 2000);
    }, 500);
  };

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    name: ''
  });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = reviewImages.length + newFiles.length;

    if (totalFiles > 5) {
      showToast("Maximum 5 images allowed", "error");
      return;
    }

    const validFiles = newFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} is too large (max 5MB)`, "error");
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setReviewImages(prev => [...prev, ...validFiles]);
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadReviewImages = async (): Promise<string[]> => {
    if (reviewImages.length === 0) return [];

    setUploadingImages(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      reviewImages.forEach(file => {
        formData.append('images', file);
      });
      formData.append('folder', 'shaikhjee/reviews');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/images/upload-multiple`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      return data.images.map((img: { url: string }) => img.url);
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Please login to submit a review", "error");
      router.push('/login');
      return;
    }

    setSubmittingReview(true);

    try {
      let imageUrls: string[] = [];
      if (reviewImages.length > 0) {
        try {
          imageUrls = await uploadReviewImages();
        } catch {
          showToast("Failed to upload images. Submitting review without images.", "error");
        }
      }

      const token = localStorage.getItem('token');
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/create`;
      const csrfToken = await getCSRFToken();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          images: imageUrls
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error. Please ensure backend is running on port 5000.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      showToast(data.message === 'Review updated successfully' ? 'Review updated successfully!' : 'Review submitted successfully!', 'success');

      if (data.review) {
        const newReview = {
          ...data.review,
          userName: data.review.userName || user?.name || 'Anonymous',
          verified: data.review.verified || false,
          helpful: data.review.helpful || 0
        };

        const existingReviewIndex = reviews.findIndex(r => r._id === newReview._id);
        if (existingReviewIndex >= 0) {
          setReviews(prev => prev.map(r => r._id === newReview._id ? newReview : r));
        } else {
          setReviews(prev => [newReview, ...prev]);
        }
      }

      setActiveTab('reviews');
      setReviewForm({ rating: 5, comment: '', name: '' });
      setReviewImages([]);
      setImagePreviews([]);

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
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 via-white to-purple-50/20">
      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-pink-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <Link href="/shop" className="text-gray-500 hover:text-pink-500 transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg">
              <Image
                src={product.images?.[selectedImage] || product.images?.[0] || '/placeholder.png'}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    New
                  </span>
                )}
                {discountPercentage && discountPercentage > 0 && (
                  <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                    -{discountPercentage}% OFF
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    Best Seller
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isInWishlist(product._id)
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-pink-500 hover:scale-110'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all ${
                      selectedImage === index
                        ? 'ring-3 ring-pink-500 ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-wider rounded-full">
              <Package className="w-3.5 h-3.5" />
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-gray-500">
                {product.rating || 0} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Rs. {product.price?.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  Rs. {product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600 leading-relaxed">
              {product.description?.substring(0, 150)}...
            </p>

            {/* Shades */}
            {product.shades && product.shades.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Shade: <span className="text-pink-500">{selectedShade?.name}</span>
                  </span>
                  <button
                    onClick={() => setIsShadeGuideOpen(true)}
                    className="flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-600 transition-colors"
                  >
                    <HelpCircle size={16} />
                    Shade Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.shades.map((shade) => (
                    <button
                      key={shade._id}
                      onClick={() => setSelectedShade(shade)}
                      className={`relative w-10 h-10 rounded-full transition-all ${
                        selectedShade?._id === shade._id
                          ? 'ring-3 ring-pink-500 ring-offset-2 scale-110'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: shade.color }}
                      title={shade.name}
                    >
                      {selectedShade?._id === shade._id && (
                        <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {product.inStock ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Back in Stock Alert */}
            {!product.inStock && (
              <BackInStockAlert
                productId={product._id}
                productName={product.name}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  justAdded
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl hover:shadow-pink-500/25 hover:-translate-y-0.5'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
              >
                {isAddingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : justAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <SocialShareButtons
                url={productUrl}
                title={product.name}
                description={product.description}
                image={product.images?.[0] || '/placeholder.png'}
                price={product.price}
              />
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              {[
                { icon: Truck, title: 'Free Delivery', desc: 'Above Rs.1500' },
                { icon: RefreshCw, title: 'Easy Returns', desc: '7 Days' },
                { icon: Shield, title: '100% Authentic', desc: 'Guaranteed' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-pink-500" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Recommendations */}
        <ProductRecommendations product={product} />

        {/* Tabs Section */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          {/* Tab Headers */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit mx-auto mb-8">
            {[
              { id: 'description', label: 'Description' },
              { id: 'ingredients', label: 'Ingredients' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'description' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50">
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                {product.skinTypes && product.skinTypes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Suitable for:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.skinTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-pink-50 text-pink-600 text-sm font-medium rounded-full"
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
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50 space-y-6">
                {product.ingredients && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Ingredients</h4>
                    <p className="text-gray-600 leading-relaxed">{product.ingredients}</p>
                  </div>
                )}
                {product.usage && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">How to Use</h4>
                    <p className="text-gray-600 leading-relaxed">{product.usage}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Review Form */}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Share Your Experience</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="transition-transform hover:scale-125"
                            >
                              <Star
                                className={`w-8 h-8 ${reviewForm.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Your Review</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          rows={4}
                          required
                          placeholder="Share your thoughts about this product..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 resize-none transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                          Add Photos (Optional)
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative w-20 h-20 group">
                              <Image
                                src={preview}
                                alt={`Review image ${index + 1}`}
                                fill
                                className="object-cover rounded-xl border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeReviewImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {imagePreviews.length < 5 && (
                            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all">
                              <Camera size={20} className="text-gray-400 mb-1" />
                              <span className="text-xs text-gray-400">Add</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!reviewForm.comment.trim() || submittingReview || uploadingImages}
                      className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {(submittingReview || uploadingImages) && <Loader2 className="w-5 h-5 animate-spin" />}
                      {uploadingImages ? 'Uploading Images...' : submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50 text-center">
                    <Star size={48} className="mx-auto mb-4 text-pink-400" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Share Your Experience</h3>
                    <p className="text-gray-500 mb-6">Login to submit a review for this product</p>
                    <button
                      onClick={() => router.push('/login')}
                      className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      Login to Review
                    </button>
                  </div>
                )}

                {/* Reviews Summary */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                        {averageRating}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating)) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {ratingDistribution.map(({ rating, count, percentage }) => (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm font-medium">{rating}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-sm text-gray-500 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-800">Customer Reviews</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
                  </div>
                ) : sortedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {sortedReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {(review.userName || review.user?.name || 'A').charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">
                                {review.userName || review.user?.name || 'Anonymous'}
                              </span>
                              {review.verified && (
                                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>

                            <p className="text-gray-600 mb-4">{review.comment}</p>

                            {review.images && review.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {review.images.map((img, imgIndex) => (
                                  <a
                                    key={imgIndex}
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative w-16 h-16 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                                  >
                                    <Image
                                      src={img}
                                      alt={`Review photo ${imgIndex + 1}`}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => handleHelpfulClick(review._id)}
                              disabled={helpfulReviews.has(review._id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                                helpfulReviews.has(review._id)
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                              }`}
                            >
                              <ThumbsUp className={`w-4 h-4 ${helpfulReviews.has(review._id) ? 'fill-white' : ''}`} />
                              Helpful
                              {(review.helpful || 0) > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${helpfulReviews.has(review._id) ? 'bg-white/20' : 'bg-pink-100 text-pink-600'}`}>
                                  {review.helpful}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 shadow-sm border border-pink-50 text-center">
                    <Star size={48} className="mx-auto mb-4 text-gray-300" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">No Reviews Yet</h4>
                    <p className="text-gray-500">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shade Guide Modal */}
      <ShadeGuide
        isOpen={isShadeGuideOpen}
        onClose={() => setIsShadeGuideOpen(false)}
        productShades={product.shades}
        productCategory={product.category}
        onSelectShade={(shade) => {
          setSelectedShade(shade);
          setIsShadeGuideOpen(false);
        }}
      />
    </div>
  );
};
