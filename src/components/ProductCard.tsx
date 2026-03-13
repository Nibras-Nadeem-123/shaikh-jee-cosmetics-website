"use client"
import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useApp } from '../contexts/AppContext';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, }) => {
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
    const inWishlist = isInWishlist(product._id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product); // addToCart takes the whole product object
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <div
            className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Link
                    href={`/product/${product.slug}`}>

                    <Image
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.name || 'Product Image'} // Ensure fallback for alt
                        width={500}
                        height={500}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Crect fill='%23f3f4f6' width='500' height='500'/%3E%3C/svg%3E"
                        onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.isNew && (
                        <span className="px-2 py-1 bg-[#D4AF87] text-white text-xs rounded">New</span>
                    )}
                    {product.discount && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">-{product.discount}%</span>
                    )}
                    {product.isBestSeller && (
                        <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded">Best Seller</span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        size={18}
                        className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                </button>

                {/* Quick Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#D4AF87] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                >
                    <ShoppingCart size={16} />
                    <span className="text-sm">Add to Cart</span>
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                <h3 className="text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-600">({product.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    )}
                </div>

                {/* Shades Preview */}
                {product.shades && product.shades.length > 0 && (
                    <div className="flex gap-1 mt-2">
                        {product.shades.slice(0, 5).map((shade) => (
                            <div
                                key={shade.id}
                                className="w-5 h-5 rounded-full border border-gray-300"
                                style={{ backgroundColor: shade.color }}
                                title={shade.name}
                            />
                        ))}
                        {product.shades.length > 5 && (
                            <div className="w-5 h-5 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                                +{product.shades.length - 5}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
