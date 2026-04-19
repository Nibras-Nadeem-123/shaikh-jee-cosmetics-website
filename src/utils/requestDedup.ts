/**
 * Request Deduplication Utility
 * Prevents duplicate API calls by caching in-flight requests
 */

type PendingRequest<T> = Promise<T>;

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest<unknown>> = new Map();
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private defaultCacheTTL = 5000; // 5 seconds default cache

  /**
   * Generate a unique key for a request
   */
  private generateKey(endpoint: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramString}`;
  }

  /**
   * Execute a request with deduplication
   * If the same request is already in-flight, return the existing promise
   * If cached data exists and is valid, return cached data
   */
  async dedupe<T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: {
      cacheTTL?: number; // Cache time-to-live in ms
      forceRefresh?: boolean; // Skip cache and force new request
    }
  ): Promise<T> {
    const { cacheTTL = this.defaultCacheTTL, forceRefresh = false } = options || {};

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        return cached.data as T;
      }
    }

    // Check if request is already in-flight
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Create new request
    const request = requestFn()
      .then((data) => {
        // Cache the result
        this.cache.set(key, { data, timestamp: Date.now() });
        return data;
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(key);
      });

    // Store as pending
    this.pendingRequests.set(key, request);

    return request;
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear all pending requests (useful for logout)
   */
  clearPending(): void {
    this.pendingRequests.clear();
  }

  /**
   * Clear everything
   */
  reset(): void {
    this.pendingRequests.clear();
    this.cache.clear();
  }
}

// Singleton instance
export const requestDedup = new RequestDeduplicator();

// Request keys for common operations
export const REQUEST_KEYS = {
  WISHLIST: 'wishlist:get',
  CART: 'cart:get',
  USER_PROFILE: 'user:profile',
  ORDERS: 'orders:list',
  PRODUCTS: (params?: string) => `products:list:${params || 'default'}`,
  PRODUCT: (slug: string) => `product:${slug}`,
} as const;
