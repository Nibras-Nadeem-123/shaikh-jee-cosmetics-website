"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, TrendingUp, X, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import CdnImage from './CdnImage';
import Link from 'next/link';

interface SearchSuggestion {
  name: string;
  category: string;
  results: number;
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  className?: string;
}

const RECENT_SEARCHES_KEY = 'shaikh_jee_recent_searches';
const MAX_RECENT_SEARCHES = 5;

// Popular searches (can be fetched from backend)
const POPULAR_SEARCHES = [
  'Lipstick',
  'Foundation',
  'Mascara',
  'Concealer',
  'Eye Shadow',
  'Face Serum',
  'Moisturizer',
  'Sunscreen'
];

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onSearch,
  initialQuery = '',
  className = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches');
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== searchTerm.toLowerCase());
      const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear a specific recent search
  const removeRecentSearch = useCallback((searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== searchTerm);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  // Fetch search suggestions and products
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        setProductResults([]);
        return;
      }

      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // Fetch both suggestions and product autocomplete in parallel
        const [suggestionsRes, productsRes] = await Promise.all([
          fetch(`${baseUrl}/products/search/suggestions?query=${encodeURIComponent(debouncedQuery)}`),
          fetch(`${baseUrl}/products/search/autocomplete?query=${encodeURIComponent(debouncedQuery)}&limit=4`)
        ]);

        const [suggestionsData, productsData] = await Promise.all([
          suggestionsRes.json(),
          productsRes.json()
        ]);

        setSuggestions(suggestionsData.suggestions || []);
        setProductResults(productsData.products || []);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Handle search submission
  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    saveRecentSearch(searchTerm);
    setShowDropdown(false);
    setQuery(searchTerm);
    onSearch(searchTerm);
    inputRef.current?.blur();
  }, [onSearch, saveRecentSearch]);

  // Get all selectable items for keyboard navigation
  const getSelectableItems = useCallback(() => {
    const items: { type: 'suggestion' | 'product' | 'recent' | 'popular'; value: string; product?: Product }[] = [];

    if (query.length >= 2) {
      // Add suggestions
      suggestions.forEach(s => items.push({ type: 'suggestion', value: s.name }));
      // Add product results
      productResults.forEach(p => items.push({ type: 'product', value: p.name, product: p }));
    } else {
      // Add recent searches
      recentSearches.forEach(s => items.push({ type: 'recent', value: s }));
      // Add popular searches
      POPULAR_SEARCHES.slice(0, 6).forEach(s => items.push({ type: 'popular', value: s }));
    }

    return items;
  }, [query, suggestions, productResults, recentSearches]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = getSelectableItems();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          const item = items[activeIndex];
          if (item.type === 'product' && item.product) {
            // Navigate to product page
            window.location.href = `/product/${item.product.slug}`;
          } else {
            handleSearch(item.value);
          }
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [activeIndex, getSelectableItems, handleSearch, query]);

  // Reset active index when dropdown visibility or query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [showDropdown, query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showRecentAndPopular = query.length < 2 && (recentSearches.length > 0 || true);
  const showSearchResults = query.length >= 2;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for products, brands..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full py-4 pl-14 pr-12 text-sm font-medium transition-all border-2 border-transparent rounded-full shadow-sm bg-muted focus:outline-none focus:bg-white focus:border-primary hover:shadow-md"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch('');
              inputRef.current?.focus();
            }}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={() => handleSearch(query)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden bg-white border shadow-xl top-full rounded-2xl border-border animate-in fade-in slide-in-from-top duration-200"
        >
          {loading ? (
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="w-5 h-5 border-2 rounded-full border-primary border-t-transparent animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Recent & Popular Searches (when no query) */}
              {showRecentAndPopular && !showSearchResults && (
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center justify-between px-2 mb-2">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                          <Clock size={14} />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={search}
                          onClick={() => handleSearch(search)}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-colors group ${
                            activeIndex === index ? 'bg-muted' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-muted-foreground" />
                            <span className="text-sm font-medium">{search}</span>
                          </div>
                          <button
                            onClick={(e) => removeRecentSearch(search, e)}
                            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-muted-foreground transition-all"
                          >
                            <X size={14} />
                          </button>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-2 mb-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                      <TrendingUp size={14} />
                      <span>Popular Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2 px-2">
                      {POPULAR_SEARCHES.map((search, idx) => (
                        <button
                          key={search}
                          onClick={() => handleSearch(search)}
                          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                            activeIndex === recentSearches.length + idx
                              ? 'bg-primary text-white'
                              : 'bg-muted hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Search Results (when query exists) */}
              {showSearchResults && (
                <>
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="p-3 border-b border-border">
                      <div className="px-2 mb-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                        Suggestions
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.name}
                          onClick={() => handleSearch(suggestion.name)}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-colors ${
                            activeIndex === index ? 'bg-muted' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Search size={16} className="text-muted-foreground" />
                            <div className="text-left">
                              <div className="text-sm font-medium">{suggestion.name}</div>
                              <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {suggestion.results} products
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Results */}
                  {productResults.length > 0 && (
                    <div className="p-3">
                      <div className="px-2 mb-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                        Products
                      </div>
                      {productResults.map((product, idx) => (
                        <Link
                          key={product._id}
                          href={`/product/${product.slug}`}
                          onClick={() => {
                            saveRecentSearch(query);
                            setShowDropdown(false);
                          }}
                          className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors ${
                            activeIndex === suggestions.length + idx ? 'bg-muted' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <CdnImage
                              src={product.images?.[0] || '/placeholder.png'}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                              fallbackSrc="/placeholder.png"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.category}</div>
                            <div className="text-sm font-bold text-primary">Rs.{product.price?.toLocaleString()}</div>
                          </div>
                        </Link>
                      ))}

                      {/* View All Results */}
                      <button
                        onClick={() => handleSearch(query)}
                        className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
                      >
                        <span>View all results for "{query}"</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* No Results */}
                  {!loading && suggestions.length === 0 && productResults.length === 0 && (
                    <div className="p-8 text-center">
                      <Search size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        No results found for "<span className="font-medium">{query}</span>"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
