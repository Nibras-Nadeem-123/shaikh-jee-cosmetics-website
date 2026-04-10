"use client";

import React, { useState, useEffect } from 'react';
import { Filter, X, SlidersHorizontal, Check } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories?: string[];
  brands?: string[];
  priceRange?: { min: number; max: number };
}

interface FilterState {
  categories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  inStock: boolean;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating' | 'bestselling';
}

export function SearchFilters({ onFilterChange, categories = [], brands = [] }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceMin: 0,
    priceMax: 5000,
    rating: 0,
    inStock: false,
    sortBy: 'newest'
  });

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleBrandToggle = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'priceMin' : 'priceMax']: value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating
    }));
  };

  const handleInStockChange = () => {
    setFilters(prev => ({
      ...prev,
      inStock: !prev.inStock
    }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  };

  const handleClearFilters = () => {
    const cleared = {
      categories: [],
      brands: [],
      priceMin: 0,
      priceMax: 5000,
      rating: 0,
      inStock: false,
      sortBy: 'newest' as const
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const activeFiltersCount = [
    filters.categories.length,
    filters.brands.length,
    filters.rating > 0 ? 1 : 0,
    filters.inStock ? 1 : 0,
    (filters.priceMin > 0 || filters.priceMax < 5000) ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="relative">
      {/* Filter Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            activeFiltersCount > 0
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background hover:bg-muted'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
          className="px-4 py-2 rounded-full border border-border bg-background hover:bg-muted transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="bestselling">Best Selling</option>
        </select>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="p-6 bg-card rounded-2xl border border-border shadow-lg animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Categories */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        filters.categories.includes(category)
                          ? 'bg-primary border-primary'
                          : 'border-border group-hover:border-primary/50'
                      }`}
                    >
                      {filters.categories.includes(category) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="sr-only"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Brands</h4>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        filters.brands.includes(brand)
                          ? 'bg-primary border-primary'
                          : 'border-border group-hover:border-primary/50'
                      }`}
                    >
                      {filters.brands.includes(brand) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="sr-only"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Price Range</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Min</span>
                    <span className="text-sm font-medium">₹{filters.priceMin}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceMin}
                    onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Max</span>
                    <span className="text-sm font-medium">₹{filters.priceMax}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceMax}
                    onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Rating & Stock */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Rating & Availability</h4>
              
              {/* Rating Filter */}
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Minimum Rating</span>
                <div className="flex gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.rating === rating
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {rating}+ ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Only */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-10 h-6 rounded-full transition-all ${
                    filters.inStock ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform translate-y-0.5 ${
                      filters.inStock ? 'translate-x-4.5 ml-4' : 'translate-x-0.5 ml-0.5'
                    }`}
                  />
                </div>
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={handleInStockChange}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  In Stock Only
                </span>
              </label>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
