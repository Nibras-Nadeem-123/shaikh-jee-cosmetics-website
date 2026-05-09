"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types';
import { apiService } from '@/services/api';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import { useApp } from '@/contexts/AppContext';
import { ShoppingCart, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import CdnImage from './CdnImage';
import Link from 'next/link';

interface ProductRecommendationsProps {
  product: Product;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ product }) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForBundle, setSelectedForBundle] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useApp();

  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = useCallback((p: Product) => {
    setQuickViewProduct(p);
    setIsQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 200);
  }, []);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product.slug) return;

      setLoading(true);
      try {
        const data = await apiService.getRelatedProducts(product.slug, 8);
        if (data && data.products) {
          setRelatedProducts(data.products);
          // Pre-select first 2 products for bundle
          const initialSelection = new Set<string>();
          data.products.slice(0, 2).forEach((p: Product) => initialSelection.add(p._id));
          setSelectedForBundle(initialSelection);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product.slug]);

  const toggleBundleSelection = (productId: string) => {
    setSelectedForBundle(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const bundleProducts = relatedProducts.filter(p => selectedForBundle.has(p._id));
  const bundleTotal = bundleProducts.reduce((sum, p) => sum + p.price, 0) + product.price;

  const handleAddAllToCart = () => {
    // Add current product
    addToCart(product);
    // Add selected bundle products
    bundleProducts.forEach(p => addToCart(p));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-48 h-64 bg-gray-200 rounded-lg flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  const frequentlyBoughtProducts = relatedProducts.slice(0, 3);
  const youMayAlsoLikeProducts = relatedProducts.slice(0, 6);

  return (
    <div className="space-y-12 py-8">
      {/* Frequently Bought Together */}
      {frequentlyBoughtProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Frequently Bought Together</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              {/* Current Product */}
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-lg overflow-hidden border-2 border-primary shadow-sm">
                  <CdnImage
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder.png"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  This item
                </div>
              </div>

              {/* Plus signs and related products */}
              {frequentlyBoughtProducts.map((relatedProduct, index) => (
                <React.Fragment key={relatedProduct._id}>
                  <Plus className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  <button
                    onClick={() => toggleBundleSelection(relatedProduct._id)}
                    className="relative group"
                  >
                    <div className={`w-32 h-32 bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedForBundle.has(relatedProduct._id)
                        ? 'border-primary shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <CdnImage
                        src={relatedProduct.images?.[0] || '/placeholder.png'}
                        alt={relatedProduct.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        fallbackSrc="/placeholder.png"
                      />
                    </div>
                    <div className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      selectedForBundle.has(relatedProduct._id)
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-300 text-gray-400'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <p className="mt-2 text-xs text-center text-gray-600 line-clamp-2 max-w-[128px]">
                      {relatedProduct.name}
                    </p>
                    <p className="text-sm font-semibold text-center">
                      Rs. {relatedProduct.price.toLocaleString()}
                    </p>
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Bundle Total and Add All Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-200">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500">
                  Total for {selectedForBundle.size + 1} items:
                </p>
                <p className="text-2xl font-bold text-primary">
                  Rs. {bundleTotal.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleAddAllToCart}
                disabled={selectedForBundle.size === 0}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add All to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* You May Also Like */}
      {youMayAlsoLikeProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">You May Also Like</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {youMayAlsoLikeProducts.map(relatedProduct => (
              <div
                key={relatedProduct._id}
                className="flex-shrink-0 w-[280px] snap-start"
              >
                <ProductCard product={relatedProduct} onQuickView={handleQuickView} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </div>
  );
};
