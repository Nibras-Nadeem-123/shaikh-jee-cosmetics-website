"use client"
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Filter, X, ChevronDown, LayoutGrid, List, Search, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/services/api';
import { Category, Product } from '@/types'; // Assuming Product type is defined

export const ShopPageComponent = () => {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams?.get('search') || '';
  const initialCategoryParam = searchParams?.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Define a type for categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery); // Controlled search query state

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string for API
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (priceRange[0] !== 0) params.append('minPrice', priceRange[0].toString());
      if (priceRange[1] !== 5000) params.append('maxPrice', priceRange[1].toString());
      if (sortBy) params.append('sort', sortBy);
      if (searchQuery) params.append('search', searchQuery);

      const data = await apiService.getProducts(params.toString());
      setProducts(data.products);
      
      // Extract unique categories from fetched products if not already set or define them
      if (data.products && data.products.length > 0 && categories.length === 0) {
        const uniqueCategories = Array.from(new Set(data.products.map((p:Product) => p.category)))
                                      .map((catName: any) => ({ id: catName.toLowerCase(), name: catName, image: "" }));
        setCategories(uniqueCategories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, priceRange, sortBy, searchQuery, categories.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update controlled search query when URL params change
  useEffect(() => {
    if (searchParams?.get('search') !== searchQuery) {
      setSearchQuery(searchParams?.get('search') || '');
    }
    if (searchParams?.get('category') !== selectedCategory) {
      setSelectedCategory(searchParams?.get('category') || '');
    }
  }, [searchParams, searchQuery, selectedCategory]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchProducts();
  };

  const filteredProductsMemo = useMemo(() => {
    // The main filtering now happens on the backend.
    // This memo is primarily for local sorting or if any client-side filtering is still desired.
    // For now, it just returns the products fetched by fetchProducts.
    return products;
  }, [products]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 5000]);
    setSearchQuery(''); // Clear search query
    // fetchProducts() will be called by useEffect due to state change
  };

  const getSearchMessage = () => {
    if (initialSearchQuery) { // Use initialSearchQuery for message to reflect URL param
      return `Search results for "${initialSearchQuery}"`;
    }
    return 'Signature Boutique';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-primary font-bold">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-destructive font-bold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Search & Breadcrumbs Banner */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
                <Sparkles size={12} />
                <span>Shaikh Jee Collection</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">{getSearchMessage()}</h1>
              {searchQuery ? (
                <p className="text-muted-foreground italic">Found {filteredProductsMemo.length} products matching your search</p>
              ) : (
                <p className="text-muted-foreground italic">Curation of premium beauty essentials tailored for you.</p>
              )}
            </div>
            <div className="w-full md:w-96 relative group">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Make search input controlled
                onKeyPress={(e) => { // Trigger search on Enter key
                  if (e.key === 'Enter') {
                    fetchProducts();
                  }
                }}
                className="w-full pl-14 pr-6 py-4 bg-muted border-2 border-transparent rounded-full focus:outline-none focus:bg-white focus:border-primary transition-all text-sm font-medium shadow-sm hover:shadow-md"
              />
              <button onClick={() => fetchProducts()} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"><Search size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 animate-in fade-in slide-in-from-left duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/5 sticky top-28 space-y-10">
              <div className="flex justify-between items-center">
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

              <div className="bg-secondary/50 rounded-2xl p-5 border border-primary/10">
                <p className="text-[10px] italic text-primary font-medium text-center">Free premium delivery on all selections above <span className="font-bold">₹999</span></p>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right duration-500">
            {/* Toolbar */}
            <div className="bg-white rounded-4xl p-4 lg:p-6 shadow-sm border border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">{filteredProductsMemo.length}</span> signature products
                </p>
                <div className="hidden sm:flex items-center gap-2 bg-muted p-1 rounded-full border border-border">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid size={16} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><List size={16} /></button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-muted hover:bg-white border border-transparent hover:border-primary px-6 py-3 pr-12 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer outline-none focus:border-primary"
                  >
                    <option value="featured">Highly Recommended</option>
                    <option value="newest">Fresh Arrivals</option>
                    <option value="price-low">Lush Economy (Low to High)</option>
                    <option value="price-high">Luxe Investment (High to Low)</option>
                    <option value="rating">Top Appraised</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" size={14} />
                </div>
                <button onClick={() => setShowFilters(true)} className="lg:hidden p-3 bg-primary text-white rounded-full shadow-lg"><Filter size={20} /></button>
              </div>
            </div>

            {/* Grid */}
            {filteredProductsMemo.length > 0 ? (
              <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredProductsMemo.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] py-32 px-8 text-center border-2 border-dashed border-border flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground opacity-50"><Search size={32} /></div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">No matches in the vault</h3>
                  <p className="text-muted-foreground italic">Perhaps a different filter would reveal your desire?</p>
                </div>
                <button onClick={clearFilters} className="px-10 py-4 bg-primary text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[90%] max-w-sm bg-white p-10 overflow-y-auto animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Refinement</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={24} /></button>
            </div>
            {/* Simplified content from desktop sidebar could go here */}
            <p className="text-muted-foreground italic">Select your preferred beauty filters to narrow down the signature collection.</p>
          </div>
        </div>
      )}
    </div>
  );
};

