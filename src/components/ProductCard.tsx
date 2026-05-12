"use client"
import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye, Check, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useApp } from '../contexts/AppContext';
import CdnImage from './CdnImage';
import Link from 'next/link';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
    const inWishlist = isInWishlist(product._id);
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView?.(product);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(true);
        addToCart(product);

        setTimeout(() => {
            setIsAdding(false);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
        }, 500);
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product);
        }
    };

    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : product.discount;

    return (
        <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-500 border border-pink-50 hover:border-pink-100">
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                <Link href={`/product/${product.slug}`} className="block w-full h-full">
                    <CdnImage
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.name || 'Product Image'}
                        width={500}
                        height={625}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        fallbackSrc="/placeholder.png"
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            New
                        </span>
                    )}
                    {discountPercentage && discountPercentage > 0 && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-red-500/30">
                            -{discountPercentage}%
                        </span>
                    )}
                    {product.isBestSeller && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" />
                            Best
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        inWishlist
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white scale-110'
                            : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-pink-500 hover:scale-110'
                    }`}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        size={18}
                        className={inWishlist ? 'fill-white' : ''}
                    />
                </button>

                {/* Quick View Button - Shows on Hover */}
                {onQuickView && (
                    <button
                        onClick={handleQuickView}
                        className="absolute top-14 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 flex items-center justify-center shadow-lg opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-white hover:text-pink-500 hover:scale-110"
                        aria-label="Quick view"
                        title="Quick View"
                    >
                        <Eye size={18} />
                    </button>
                )}

                {/* Add to Cart Button - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || justAdded}
                        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                            justAdded
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                                : 'bg-white/95 backdrop-blur-sm text-gray-800 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white shadow-lg'
                        }`}
                    >
                        {isAdding ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
                        ) : justAdded ? (
                            <>
                                <Check size={18} />
                                Added to Cart
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={18} />
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <Link href={`/product/${product.slug}`} className="block p-4 space-y-3">
                {/* Category */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500 bg-pink-50 px-2 py-1 rounded-full">
                    {product.category}
                </span>

                {/* Name */}
                <h3 className="font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-pink-600 transition-colors">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(product.rating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-200'
                                }
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500">
                        ({product.reviewCount || 0})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Rs. {product.price?.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                            Rs. {product.originalPrice?.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Shades Preview */}
                {product.shades && product.shades.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                        {product.shades.slice(0, 5).map((shade, index) => (
                            <div
                                key={shade._id || index}
                                className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 hover:scale-125 transition-transform cursor-pointer"
                                style={{ backgroundColor: shade.color || shade.hex }}
                                title={shade.name}
                            />
                        ))}
                        {product.shades.length > 5 && (
                            <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white shadow-sm ring-1 ring-gray-200 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-gray-500">
                                    +{product.shades.length - 5}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Stock Status */}
                {!product.inStock && (
                    <div className="pt-1">
                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
            </Link>
        </div>
    );
};
