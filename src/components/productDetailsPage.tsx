"use client"
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Truck, RefreshCw, Shield, Loader2 } from 'lucide-react';
import { Product, Shade, Review } from '../types';
import { useApp } from '@/contexts/AppContext';
import { apiService } from '@/services/api'; // Import apiService
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';

interface ProductDetailsPageProps {
  product: Product;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
}) => {
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);
  const { showToast } = useToast();
  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    product.shades?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews'>(
    'description'
  );
  const [reviews, setReviews] = useState<Review[]>([]); // State for reviews
  const [reviewsLoading, setReviewsLoading] = useState(false); // State for reviews loading


  // Fetch reviews dynamically
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await apiService.getReviewsByProductId(product._id);
        setReviews(data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        showToast("Failed to fetch reviews.", "error");
      } finally {
        setReviewsLoading(false);
      }
    };

    if (activeTab === 'reviews' && product._id) {
      fetchReviews();
    }
  }, [activeTab, product._id, showToast]);

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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock review submission - integrate with API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newReview = {
      id: `r${Date.now()}`,
      productId: product._id, // Changed product.id to product._id
      userId: 'current_user', // Would come from user context
      userName: reviewForm.name || 'Anonymous',
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date()
    };

    // TODO: Send to backend
    // await apiService.addReview(newReview);

    showToast("Review submitted successfully!", "success");

    // Reset form
    setReviewForm({ rating: 5, comment: '', name: '' });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.name}
                height={600}
                width={600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect fill='%23f3f4f6' width='600' height='600'/%3E%3C/svg%3E"
                className="w-full h-full object-cover"
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
                      className="w-full h-full object-cover"
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
              <p className="text-gray-500 mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating)
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
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full">
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
                                          key={shade.id}
                                          onClick={() => setSelectedShade(shade)}
                                          className={`w-12 h-12 rounded-full border-2 ${selectedShade?.id === shade.id
                                              ? 'border-primary scale-110'
                                              : 'border-gray-300'
                                            } transition-transform`}
                                          style={{ backgroundColor: shade.color }}
                                          title={shade.name}
                                        />                  ))}
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
                    className="px-4 py-2 hover:bg-secondary transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-secondary transition-colors"
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
                className="flex-1 bg-primary text-white py-3 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleToggleWishlist}
                className="px-6 py-3 border-2 border-primary rounded-full hover:bg-secondary transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''
                    }`}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
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
        <div className="border-t border-gray-200 pt-8">
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
                <p className="text-gray-500 mb-4">{product.description}</p>
                {product.skinTypes && (
                  <div>
                    <h4 className="mb-2">Suitable for:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.skinTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary rounded-full text-sm"
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
                <form onSubmit={handleReviewSubmit} className="mb-10 bg-secondary/30 p-8 rounded-2xl border border-primary/20">
                  <h3 className="text-lg font-bold text-foreground mb-6">Share Your Experience</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Rating */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="text-2xl hover:scale-125 transition-transform"
                          >
                            <Star
                              className={reviewForm.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="Jane Doe (optional)"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Comment */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={4}
                        required
                        placeholder="Share your thoughts about this product..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!reviewForm.comment.trim()}
                    className="w-full py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </form>

                {/* Existing Reviews */}
                <h4 className="text-lg font-bold text-foreground mb-6">Customer Reviews ({reviews.length})</h4>
                {reviewsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4 mb-2">
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
                          <span>{review.userName}</span>
                          <span className="text-sm text-gray-500">
                            {typeof review.createdAt === 'string'
                              ? new Date(review.createdAt).toLocaleDateString()
                              : new Date(review.createdAt).toLocaleDateString()
                            }
                          </span>
                        </div>
                        <p className="text-gray-500">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
