'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiService } from '@/services/api';
import { Product } from '@/types';

export interface ProductFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  inStock?: boolean;
}

export interface PaginationInfo {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  from: number;
  to: number;
}

interface UseInfiniteProductsOptions {
  initialLimit?: number;
  filters?: ProductFilters;
  enabled?: boolean;
}

interface UseInfiniteProductsReturn {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  pagination: PaginationInfo | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  totalProducts: number;
}

/**
 * Hook for managing infinite scroll product loading
 * Accumulates products as user scrolls/loads more
 */
export function useInfiniteProducts(
  options: UseInfiniteProductsOptions = {}
): UseInfiniteProductsReturn {
  const { initialLimit = 12, filters = {}, enabled = true } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Track if initial load has happened
  const initialLoadDone = useRef(false);

  // Track current filters to detect changes
  const filtersRef = useRef(filters);

  // Build query params from filters
  const buildQueryParams = useCallback(
    (pageNum: number): string => {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', initialLimit.toString());

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());

      return params.toString();
    },
    [filters, initialLimit]
  );

  // Fetch products for a specific page
  const fetchProducts = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!enabled) return;

      const isFirstPage = pageNum === 1;

      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const queryParams = buildQueryParams(pageNum);
        const response = await apiService.getProducts(queryParams);

        if (response.success) {
          const newProducts = response.products || [];

          if (append) {
            setProducts((prev) => [...prev, ...newProducts]);
          } else {
            setProducts(newProducts);
          }

          // Update pagination info
          const paginationData = response.pagination || {
            total: response.totalProducts || 0,
            perPage: initialLimit,
            currentPage: pageNum,
            totalPages: response.totalPages || 1,
            hasNextPage: pageNum < (response.totalPages || 1),
            hasPrevPage: pageNum > 1,
            from: (pageNum - 1) * initialLimit + 1,
            to: Math.min(pageNum * initialLimit, response.totalProducts || 0),
          };

          setPagination(paginationData);
          setHasMore(paginationData.hasNextPage);
          setTotalProducts(paginationData.total || response.totalProducts || 0);
          setPage(pageNum);
        } else {
          setError(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [enabled, buildQueryParams, initialLimit]
  );

  // Load more products (next page)
  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    await fetchProducts(page + 1, true);
  }, [fetchProducts, page, isLoading, isLoadingMore, hasMore]);

  // Refresh from page 1
  const refresh = useCallback(async () => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    await fetchProducts(1, false);
  }, [fetchProducts]);

  // Reset state
  const reset = useCallback(() => {
    setProducts([]);
    setPage(1);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setHasMore(true);
    setPagination(null);
    setTotalProducts(0);
    initialLoadDone.current = false;
  }, []);

  // Initial load
  useEffect(() => {
    if (!enabled) return;

    // Check if filters have changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(filtersRef.current);

    if (!initialLoadDone.current || filtersChanged) {
      filtersRef.current = filters;
      initialLoadDone.current = true;
      setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts(1, false);
    }
  }, [enabled, filters, fetchProducts]);

  return {
    products,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    pagination,
    loadMore,
    refresh,
    reset,
    totalProducts,
  };
}

/**
 * Hook for traditional pagination (not infinite scroll)
 * Replaces products on each page change
 */
export function usePaginatedProducts(
  options: UseInfiniteProductsOptions & { page?: number } = {}
): UseInfiniteProductsReturn & {
  goToPage: (page: number) => Promise<void>;
  currentPage: number;
} {
  const { initialLimit = 12, filters = {}, enabled = true, page: initialPage = 1 } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  const filtersRef = useRef(filters);

  // Build query params
  const buildQueryParams = useCallback(
    (pageNum: number): string => {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', initialLimit.toString());

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());

      return params.toString();
    },
    [filters, initialLimit]
  );

  // Fetch products
  const fetchProducts = useCallback(
    async (pageNum: number) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = buildQueryParams(pageNum);
        const response = await apiService.getProducts(queryParams);

        if (response.success) {
          setProducts(response.products || []);

          const paginationData = response.pagination || {
            total: response.totalProducts || 0,
            perPage: initialLimit,
            currentPage: pageNum,
            totalPages: response.totalPages || 1,
            hasNextPage: pageNum < (response.totalPages || 1),
            hasPrevPage: pageNum > 1,
            from: (pageNum - 1) * initialLimit + 1,
            to: Math.min(pageNum * initialLimit, response.totalProducts || 0),
          };

          setPagination(paginationData);
          setTotalProducts(paginationData.total || response.totalProducts || 0);
          setCurrentPage(pageNum);
        } else {
          setError(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, buildQueryParams, initialLimit]
  );

  // Go to specific page
  const goToPage = useCallback(
    async (pageNum: number) => {
      if (pageNum < 1 || (pagination && pageNum > pagination.totalPages)) return;
      await fetchProducts(pageNum);
    },
    [fetchProducts, pagination]
  );

  // Load more (for compatibility, goes to next page)
  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage) {
      await goToPage(currentPage + 1);
    }
  }, [goToPage, currentPage, pagination]);

  // Refresh current page
  const refresh = useCallback(async () => {
    await fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  // Reset
  const reset = useCallback(() => {
    setProducts([]);
    setCurrentPage(1);
    setIsLoading(false);
    setError(null);
    setPagination(null);
    setTotalProducts(0);
  }, []);

  // Initial load and filter changes
  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(filtersRef.current);

    if (filtersChanged) {
      filtersRef.current = filters;
      setCurrentPage(1);
      fetchProducts(1);
    } else {
      fetchProducts(currentPage);
    }
  }, [filters, fetchProducts, currentPage]);

  return {
    products,
    isLoading,
    isLoadingMore: false,
    error,
    hasMore: pagination?.hasNextPage || false,
    pagination,
    loadMore,
    refresh,
    reset,
    totalProducts,
    goToPage,
    currentPage,
  };
}

export default useInfiniteProducts;
