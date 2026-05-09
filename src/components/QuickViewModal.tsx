"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Product, Shade } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';
import Link from 'next/link';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState<Shade | undefined>();
  const [quantity, setQuantity] = useState(1);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedShade(product.shades?.[0]);
      setQuantity(1);
    }
  }, [product]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product, quantity, selectedShade);
    showToast(`${product.name} added to cart!`, 'success');
  }, [product, quantity, selectedShade, addToCart, showToast]);

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showToast('Removed from wishlist', 'success');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist', 'success');
    }
  }, [product, isInWishlist, removeFromWishlist, addToWishlist, showToast]);

  const nextImage = () => {
    if (!product?.images) return;
    const images = product.images;
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    const images = product.images;
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen || !product) return null;

  const inWishlist = isInWishlist(product._id);
  const images = product.images || ['/placeholder.png'];
  const isOutOfStock = !product.inStock || (product.quantity !== undefined && product.quantity <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute z-10 p-2 transition-colors bg-white rounded-full shadow-lg top-4 right-4 hover:bg-gray-100"
          aria-label="Close quick view"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Image Section */}
          <div className="relative bg-gray-50">
            {/* Main Image */}
            <div className="relative aspect-square">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute p-2 transition-colors -translate-y-1/2 bg-white rounded-full shadow-lg left-2 top-1/2 hover:bg-gray-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute p-2 transition-colors -translate-y-1/2 bg-white rounded-full shadow-lg right-2 top-1/2 hover:bg-gray-100"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute flex flex-col gap-2 top-4 left-4">
                {product.isNew && (
                  <span className="px-2 py-1 text-xs text-white bg-primary rounded">New</span>
                )}
                {product.discount && (
                  <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">-{product.discount}%</span>
                )}
                {product.isBestSeller && (
                  <span className="px-2 py-1 text-xs text-white bg-purple-500 rounded">Best Seller</span>
                )}
                {isOutOfStock && (
                  <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col p-6 md:p-8">
            {/* Category */}
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
              {product.category}
            </p>

            {/* Name */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                Rs.{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  Rs.{product.originalPrice?.toLocaleString()}
                </span>
              )}
              {product.discount && (
                <span className="px-2 py-1 text-sm font-medium text-green-700 bg-green-100 rounded">
                  Save {product.discount}%
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <p className="text-gray-600 mb-6 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Shade Selection */}
            {product.shades && product.shades.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Shade: <span className="text-primary">{selectedShade?.name || 'Select a shade'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.shades.map((shade) => (
                    <button
                      key={shade._id}
                      onClick={() => setSelectedShade(shade)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedShade?._id === shade._id
                          ? 'border-primary ring-2 ring-primary/30 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: shade.color }}
                      title={shade.name}
                      aria-label={`Select ${shade.name}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={isOutOfStock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-3 border rounded-full transition-colors ${
                  inWishlist
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-gray-300 hover:border-primary hover:text-primary'
                }`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} className={inWishlist ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* View Full Details Link */}
            <Link
              href={`/product/${product.slug}`}
              className="flex items-center justify-center gap-2 text-primary hover:underline font-medium"
              onClick={onClose}
            >
              View Full Details
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
