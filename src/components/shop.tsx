"use client"
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Filter, X, ChevronDown, LayoutGrid, List, Search, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { Category, Product } from '@/types';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  name: string;
  category: string;
  results: number;
}

export const ShopPageComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Search suggestions state
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  // Debounced search query for API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchProducts = useCallback(async (page: number = 1) => {
    setLoading(true);
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
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
      setCurrentPage(data.currentPage || 1);

      // Extract unique categories
      if (data.products && data.products.length > 0 && categories.length === 0) {
        const uniqueCategories = Array.from(new Set(data.products.map((p: Product) => p.category)))
          .map((catName: any) => ({ id: catName.toLowerCase(), name: catName, image: "" }));
        setCategories(uniqueCategories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, priceRange, sortBy, debouncedSearchQuery, categories.length]);

  // Fetch search suggestions
  const fetchSearchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSuggestionsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/search/suggestions?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  // Fetch search suggestions when debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchSearchSuggestions(debouncedSearchQuery);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchQuery, fetchSearchSuggestions]);

  // Update controlled search query when URL params change
  useEffect(() => {
    if (searchParams?.get('search') !== searchQuery) {
      setSearchQuery(searchParams?.get('search') || '');
    }
    if (searchParams?.get('category') !== selectedCategory) {
      setSelectedCategory(searchParams?.get('category') || '');
    }
  }, [searchParams, searchQuery, selectedCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length >= 2) {
      fetchSearchSuggestions(value);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 5000]);
    setSearchQuery('');
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSearchMessage = () => {
    if (debouncedSearchQuery) {
      return `Search results for "${debouncedSearchQuery}"`;
    }
    return 'Signature Boutique';
  };

  const filteredProductsMemo = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="bg-white border-b border-border">
          <div className="container px-4 py-10 mx-auto lg:px-8">
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <div className="space-y-3">
                <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-80 animate-pulse" />
                <div className="w-64 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-full md:w-96">
                <div className="w-full bg-gray-200 rounded-full h-14 animate-pulse" />
              </div>
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl font-bold text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Search & Breadcrumbs Banner */}
      <div className="bg-white border-b border-border">
        <div className="container px-4 py-10 mx-auto lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
                <Sparkles size={12} />
                <span>Shaikh Jee Collection</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl text-foreground">{getSearchMessage()}</h1>
              {searchQuery ? (
                <p className="italic text-muted-foreground">Found {filteredProductsMemo.length} products matching your search</p>
              ) : (
                <p className="italic text-muted-foreground">Curation of premium beauty essentials tailored for you.</p>
              )}
            </div>
            <div className="relative w-full md:w-96 group">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full py-4 pr-6 text-sm font-medium transition-all border-2 border-transparent rounded-full shadow-sm pl-14 bg-muted focus:outline-none focus:bg-white focus:border-primary hover:shadow-md"
                />
                <button type="submit" className="absolute transition-colors -translate-y-1/2 right-6 top-1/2 text-muted-foreground hover:text-primary"><Search size={20} /></button>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden duration-200 bg-white border shadow-xl top-full rounded-2xl border-border animate-in fade-in slide-in-from-top">
                  {suggestionsLoading ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 rounded-full border-primary border-t-transparent animate-spin" />
                        <span>Searching...</span>
                      </div>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <div className="overflow-y-auto max-h-80">
                      <div className="p-2 text-xs font-bold tracking-widest uppercase border-b text-muted-foreground border-border">
                        Suggestions
                      </div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchSelect(suggestion.name)}
                          className="flex items-center justify-between w-full px-4 py-3 transition-colors hover:bg-muted/50 group"
                        >
                          <div className="flex items-center gap-3">
                            <Search size={16} className="transition-colors text-muted-foreground group-hover:text-primary" />
                            <div className="text-left">
                              <div className="text-sm font-medium text-foreground group-hover:text-primary">{suggestion.name}</div>
                              <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{suggestion.results} products</div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 && !suggestionsLoading ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      No suggestions found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden space-y-8 duration-500 lg:block w-72 shrink-0 animate-in fade-in slide-in-from-left">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/5 sticky top-28 space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  <h3 className="text-lg font-bold tracking-tight">Refine By</h3>
                </div>
                {(selectedCategory || selectedSubcategory || searchQuery) && (
                  <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Reset</button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Department</h4>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === cat.name}
                            onChange={() => setSelectedCategory(cat.name)}
                            className="peer appearance-none w-5 h-5 border-2 border-border rounded-full checked:border-primary checked:border-[6px] transition-all"
                          />
                        </div>
                        <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.name ? 'text-primary' : 'text-foreground/80 group-hover:text-primary'}`}>{cat.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Investment (₹)</h4>
                <div className="px-2 pt-6">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary h-1.5 bg-muted rounded-full cursor-pointer appearance-none"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground mt-4 uppercase tracking-widest">
                    <span>₹{priceRange[0]}</span>
                    <span className="text-primary">Up to ₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border bg-secondary/50 rounded-2xl border-primary/10">
                <p className="text-[10px] italic text-primary font-medium text-center">Free premium delivery on all selections above <span className="font-bold">₹999</span></p>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 space-y-8 duration-500 animate-in fade-in slide-in-from-right">
            {/* Search Filters Component */}
            <SearchFilters
              onFilterChange={(filters) => setActiveFilters(filters)}
              categories={categories.map(c => c.name)}
              brands={['Zeena', 'Habit', 'Skinory', 'Zarqa', 'Glow & Lovely']}
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border shadow-sm rounded-4xl lg:p-6 border-border">
              <div className="flex items-center gap-6">
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="font-bold text-foreground">{totalProducts}</span> signature products
                  {debouncedSearchQuery && <span className="ml-2 text-xs">(Page {currentPage} of {totalPages})</span>}
                </p>
                <div className="items-center hidden gap-2 p-1 border rounded-full sm:flex bg-muted border-border">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid size={16} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><List size={16} /></button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-6 py-3 pr-12 text-xs font-bold tracking-widest uppercase transition-all border border-transparent rounded-full outline-none appearance-none cursor-pointer bg-muted hover:bg-white hover:border-primary focus:border-primary"
                  >
                    <option value="featured">Highly Recommended</option>
                    <option value="newest">Fresh Arrivals</option>
                    <option value="price-low">Lush Economy (Low to High)</option>
                    <option value="price-high">Luxe Investment (High to Low)</option>
                    <option value="rating">Top Appraised</option>
                  </select>
                  <ChevronDown className="absolute transition-colors -translate-y-1/2 pointer-events-none right-5 top-1/2 text-muted-foreground group-hover:text-primary" size={14} />
                </div>
                <button onClick={() => setShowFilters(true)} className="p-3 text-white rounded-full shadow-lg lg:hidden bg-primary"><Filter size={20} /></button>
              </div>
            </div>

            {/* Grid */}
            {products.length > 0 ? (
              <>
                <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 transition-all border rounded-full border-border hover:bg-muted hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={20} />
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
                            className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${currentPage === pageNum
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'border border-border hover:bg-muted hover:border-primary'
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
                      className="p-3 transition-all border rounded-full border-border hover:bg-muted hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      aria-label="Next page"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-[3rem] py-32 px-8 text-center border-2 border-dashed border-border flex flex-col items-center gap-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full opacity-50 bg-muted text-muted-foreground"><Search size={32} /></div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">No matches in the vault</h3>
                  <p className="italic text-muted-foreground">Perhaps a different filter would reveal your desire?</p>
                </div>
                <button onClick={clearFilters} className="px-10 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all rounded-full shadow-xl bg-primary shadow-primary/20 hover:scale-105 active:scale-95">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 duration-300 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[90%] max-w-sm bg-white p-10 overflow-y-auto animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Refinement</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 transition-colors rounded-full hover:bg-muted"><X size={24} /></button>
            </div>
            {/* Simplified content from desktop sidebar could go here */}
            <p className="italic text-muted-foreground">Select your preferred beauty filters to narrow down the signature collection.</p>
          </div>
        </div>
      )}
    </div>
  );
};

