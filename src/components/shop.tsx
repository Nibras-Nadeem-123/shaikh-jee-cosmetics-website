"use client"
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Filter, X, ChevronDown, LayoutGrid, List, Search, Sparkles, ChevronLeft, ChevronRight, Loader2, ToggleLeft, ToggleRight, SlidersHorizontal, Package, Star, Zap, Heart, TrendingUp, Truck } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilters } from '@/components/SearchFilters';
import { QuickViewModal } from '@/components/QuickViewModal';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/services/api';
import { Category, Product } from '@/types';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteScrollTrigger } from '@/hooks/useIntersectionObserver';
import { EnhancedSearch } from '@/components/EnhancedSearch';

export const ShopPageComponent = () => {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams?.get('search') || '';
  const initialCategoryParam = searchParams?.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;


  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  // Infinite scroll state
  const [scrollMode, setScrollMode] = useState<'pagination' | 'infinite'>('pagination');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 200);
  }, []);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', productsPerPage.toString());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (priceRange[0] !== 0) params.append('minPrice', priceRange[0].toString());
      if (priceRange[1] !== 5000) params.append('maxPrice', priceRange[1].toString());
      if (sortBy) params.append('sort', sortBy);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);

      const data = await apiService.getProducts(params.toString());
      const newProducts = data.products || [];

      if (append) {
        setAllProducts(prev => [...prev, ...newProducts]);
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
        setAllProducts(newProducts);
      }

      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
      setCurrentPage(data.currentPage || 1);
      setHasMore(page < (data.totalPages || 1));

      if (newProducts.length > 0 && categories.length === 0) {
        const uniqueCategories = Array.from(new Set(newProducts.map((p: Product) => p.category)))
          .map((catName: any) => ({ id: catName.toLowerCase(), name: catName, image: "" }));
        setCategories(uniqueCategories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, selectedSubcategory, priceRange, sortBy, debouncedSearchQuery, categories.length]);

  const loadMoreProducts = useCallback(() => {
    if (!isLoadingMore && hasMore && scrollMode === 'infinite') {
      fetchProducts(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, scrollMode, currentPage, fetchProducts]);

  const sentinelRef = useInfiniteScrollTrigger(loadMoreProducts, {
    enabled: scrollMode === 'infinite' && hasMore && !isLoadingMore,
    rootMargin: '200px',
  });

  const resetProducts = useCallback(() => {
    setAllProducts([]);
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);


  useEffect(() => {
    fetchProducts(1, false);
  }, []);

  useEffect(() => {
    if (scrollMode === 'infinite') {
      setAllProducts([]);
      setProducts([]);
      setHasMore(true);
    }
    setCurrentPage(1);
    fetchProducts(1, false);
  }, [selectedCategory, selectedSubcategory, priceRange, sortBy, debouncedSearchQuery]);

  useEffect(() => {
    if (scrollMode === 'pagination' && currentPage > 1) {
      fetchProducts(currentPage, false);
    }
  }, [currentPage, scrollMode]);


  useEffect(() => {
    if (searchParams?.get('search') !== searchQuery) {
      setSearchQuery(searchParams?.get('search') || '');
    }
    if (searchParams?.get('category') !== selectedCategory) {
      setSelectedCategory(searchParams?.get('category') || '');
    }
  }, [searchParams, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 5000]);
    setSearchQuery('');
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && scrollMode === 'pagination') {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleScrollMode = () => {
    const newMode = scrollMode === 'pagination' ? 'infinite' : 'pagination';
    setScrollMode(newMode);
    if (newMode === 'infinite') {
      setAllProducts([]);
      setProducts([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchProducts(1, false);
    } else {
      setCurrentPage(1);
      fetchProducts(1, false);
    }
  };

  const getSearchMessage = () => {
    if (debouncedSearchQuery) {
      return `Results for "${debouncedSearchQuery}"`;
    }
    if (selectedCategory) {
      return selectedCategory;
    }
    return 'All Products';
  };

  const filteredProductsMemo = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const categoryIcons: { [key: string]: any } = {
    'Skincare': Heart,
    'Makeup': Sparkles,
    'Hair Care': Star,
    'Fragrances': Zap,
    'default': Package
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/50 via-white to-purple-50/30">
        {/* Hero Skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          <div className="container px-4 py-16 mx-auto lg:px-8 lg:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-4 mx-auto mb-4 bg-white/30 rounded-full animate-pulse" />
              <div className="h-12 mx-auto mb-4 bg-white/30 rounded-2xl animate-pulse max-w-md" />
              <div className="w-64 h-4 mx-auto mb-8 bg-white/30 rounded-full animate-pulse" />
              <div className="max-w-lg mx-auto h-14 bg-white/30 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="container px-4 py-12 mx-auto lg:px-8">
          <ProductCardSkeleton count={productsPerPage} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => fetchProducts(1)}
          className="px-8 py-3 mt-4 font-semibold text-white rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 via-white to-purple-50/30">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAyNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative px-4 py-16 mx-auto lg:px-8 lg:py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4" />
              <span>Premium Beauty Collection</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl mb-4">
              {getSearchMessage()}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              {searchQuery
                ? `Found ${totalProducts} products matching your search`
                : 'Discover our curated collection of premium beauty essentials'
              }
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <EnhancedSearch
                initialQuery={searchQuery}
                onSearch={(query) => {
                  setSearchQuery(query);
                  setCurrentPage(1);
                  fetchProducts(1);
                }}
                className="w-full"
              />
            </div>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  fetchProducts(1);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-white text-pink-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                All Products
              </button>
              {categories.slice(0, 4).map((cat) => {
                const IconComponent = categoryIcons[cat.name] || categoryIcons['default'];
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      fetchProducts(1);
                    }}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2 ${
                      selectedCategory === cat.name
                        ? 'bg-white text-pink-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(253, 242, 248)" fillOpacity="0.5"/>
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 space-y-6">
              {/* Filter Header Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg shadow-pink-500/5 border border-pink-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <SlidersHorizontal size={18} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                  </div>
                  {(selectedCategory || selectedSubcategory || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => {
                      const IconComponent = categoryIcons[cat.name] || categoryIcons['default'];
                      const isSelected = selectedCategory === cat.name;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(isSelected ? '' : cat.name)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                              : 'bg-gray-50 text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium text-sm">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Price Range Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg shadow-pink-500/5 border border-pink-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Price Range</h4>
                <div className="px-2 pt-4">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between mt-4">
                    <span className="text-sm font-medium text-gray-500">Rs. {priceRange[0]}</span>
                    <span className="text-sm font-bold text-pink-500">Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative">
                  <Truck className="w-8 h-8 mb-3" />
                  <h4 className="font-bold text-lg mb-1">Free Shipping</h4>
                  <p className="text-white/80 text-sm">On orders above Rs. 1500</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-sm lg:p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {totalProducts} Products
                  </span>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-pink-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-pink-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Scroll Mode Toggle */}
                <button
                  onClick={toggleScrollMode}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    scrollMode === 'infinite'
                      ? 'bg-pink-50 border-pink-200 text-pink-600'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-pink-50 hover:border-pink-200'
                  }`}
                >
                  {scrollMode === 'pagination' ? (
                    <>
                      <ToggleLeft size={18} />
                      <span>Pages</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight size={18} />
                      <span>Infinite</span>
                    </>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-5 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:bg-pink-50 hover:border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl shadow-lg shadow-pink-500/25"
                >
                  <Filter size={20} />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || priceRange[1] < 5000) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-600 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors"
                  >
                    {selectedCategory}
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {priceRange[1] < 5000 && (
                  <button
                    onClick={() => setPriceRange([0, 5000])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    Under Rs. {priceRange[1]}
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Products Grid */}
            {products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {products.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} onQuickView={handleQuickView} />
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll */}
                {scrollMode === 'infinite' && (
                  <>
                    <div ref={sentinelRef} className="h-4" />

                    {isLoadingMore && (
                      <div className="flex items-center justify-center gap-3 py-12">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center animate-pulse">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Loading more products...</span>
                      </div>
                    )}

                    {!isLoadingMore && hasMore && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={loadMoreProducts}
                          className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all hover:-translate-y-0.5"
                        >
                          Load More Products
                        </button>
                      </div>
                    )}

                    {!hasMore && products.length > 0 && (
                      <div className="py-12 text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full">
                          <Sparkles className="w-4 h-4 text-pink-500" />
                          <span className="text-sm font-medium text-gray-600">You've seen all products</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Pagination */}
                {scrollMode === 'pagination' && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 bg-white border border-pink-100 rounded-xl hover:bg-pink-50 hover:border-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-11 h-11 rounded-xl font-semibold text-sm transition-all ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                                : 'bg-white border border-pink-100 text-gray-600 hover:bg-pink-50 hover:border-pink-200 shadow-sm'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 bg-white border border-pink-100 rounded-xl hover:bg-pink-50 hover:border-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl py-20 px-8 text-center border border-pink-100 shadow-lg">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your criteria. Try adjusting your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg shadow-pink-500/25 hover:shadow-xl transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <SlidersHorizontal size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Categories */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const IconComponent = categoryIcons[cat.name] || categoryIcons['default'];
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(isSelected ? '' : cat.name);
                          setShowFilters(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-pink-50'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Range</h4>
                <div className="px-2 pt-4">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg"
                  />
                  <div className="flex justify-between mt-4">
                    <span className="text-sm font-medium text-gray-500">Rs. {priceRange[0]}</span>
                    <span className="text-sm font-bold text-pink-500">Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || priceRange[1] < 5000) && (
                <button
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                  className="w-full py-3.5 border-2 border-pink-500 text-pink-500 font-semibold rounded-xl hover:bg-pink-50 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25"
              >
                Show {totalProducts} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
