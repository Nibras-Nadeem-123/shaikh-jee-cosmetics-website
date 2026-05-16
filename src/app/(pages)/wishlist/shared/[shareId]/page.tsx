"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, ShoppingCart, Eye, Share2, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { apiService } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/useToast';
import CdnImage from '@/components/CdnImage';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';

interface SharedWishlistData {
  shareId: string;
  title: string;
  message: string;
  ownerName: string;
  products: Product[];
  productCount: number;
  viewCount: number;
  createdAt: string;
  expiresAt: string | null;
}

export default function SharedWishlistPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const { addToCart, addToWishlist } = useApp();
  const { showToast } = useToast();

  const [wishlistData, setWishlistData] = useState<SharedWishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      if (!shareId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getSharedWishlist(shareId);
        if (data.success) {
          setWishlistData(data.sharedWishlist);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedWishlist();
  }, [shareId]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleAddAllToCart = () => {
    if (!wishlistData) return;
    wishlistData.products.forEach(product => {
      addToCart(product);
    });
    showToast(`Added ${wishlistData.products.length} items to cart!`, 'success');
  };

  const handleAddToMyWishlist = (product: Product) => {
    addToWishlist(product);
    showToast(`${product.name} added to your wishlist!`, 'success');
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (!wishlistData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Owner Info */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span>Shared by <strong className="text-gray-900">{wishlistData.ownerName}</strong></span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {wishlistData.title}
            </h1>

            {/* Message */}
            {wishlistData.message && (
              <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                "{wishlistData.message}"
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
              <span>{wishlistData.productCount} items</span>
              <span>•</span>
              <span>{wishlistData.viewCount} views</span>
              <span>•</span>
              <span>Shared {new Date(wishlistData.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistData.products.map((product) => (
            <div key={product._id} className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Link href={`/product/${product.slug}`}>
                  <CdnImage
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackSrc="/placeholder.png"
                  />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="px-2 py-1 bg-primary text-white text-xs rounded">New</span>
                  )}
                  {product.discount && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">-{product.discount}%</span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleQuickView(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleAddToMyWishlist(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="Add to My Wishlist"
                  >
                    <Heart className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product);
                      showToast(`${product.name} added to cart!`, 'success');
                    }}
                    className="p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">Rs.{product.price?.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">Rs.{product.originalPrice?.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {wishlistData.products.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">This wishlist is empty</h3>
            <p className="text-gray-600 mb-6">No products have been added to this wishlist yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </div>
  );
}
