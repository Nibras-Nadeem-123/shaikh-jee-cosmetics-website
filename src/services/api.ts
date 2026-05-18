const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get headers for API requests
 * Using JWT-only authentication - no CSRF token needed
 */
const getHeaders = async (includeAuth = false, contentType = 'application/json'): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  // Add JWT auth token if needed
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Make a fetch request with CSRF and credentials
 */
const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};

export const apiService = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned unexpected response. Please ensure the backend is running on ' + API_URL);
      }
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid credentials');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running on ' + API_URL);
      }
      throw error;
    }
  },

  signup: async (userData: { name: string; email: string; password: string; referralCode?: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned unexpected response. Please ensure the backend is running on ' + API_URL);
      }
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Products
  getProducts: async (params: string = '') => {
    const fetchUrl = `${API_URL}/products${params ? '?' + params : ''}`;
    try {
      const response = await fetch(fetchUrl, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch products (Status: ${response.status})`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Unable to connect to server. Please check if backend is running on ' + API_URL + ' and is accessible. Original error: ' + error.message);
      }
      throw error;
    }
  },

  getProduct: async (slug: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${slug}`, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch product');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getRelatedProducts: async (slug: string, limit: number = 8) => {
    try {
      const response = await fetch(`${API_URL}/products/${slug}/related?limit=${limit}`, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch related products');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getBestSellers: async (limit: number = 8) => {
    try {
      const response = await fetch(`${API_URL}/products?isBestSeller=true&limit=${limit}`, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch best sellers');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getFeaturedProducts: async (limit: number = 8) => {
    try {
      const response = await fetch(`${API_URL}/products?featured=true&limit=${limit}`, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch featured products');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Orders
  createOrder: async (orderData: any, token: string) => {
    try {
      const headers = await getHeaders(false);
      headers['Authorization'] = `Bearer ${token}`;

      const response = await apiFetch(`${API_URL}/orders/new`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getMyOrders: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch orders');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Admin Actions
  createProduct: async (productData: any, token: string) => {
    try {
      // Get CSRF token for the request
      let csrfToken = getCurrentCSRFToken();
      if (!csrfToken) {
        try {
          csrfToken = await getCSRFToken();
        } catch (e) {
          console.warn('Could not get CSRF token');
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`${API_URL}/products/admin/new`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Create product with image file uploads
  createProductWithImages: async (formData: FormData, token: string) => {
    try {
      // Get CSRF token for the request
      let csrfToken = getCurrentCSRFToken();
      if (!csrfToken) {
        try {
          csrfToken = await getCSRFToken();
        } catch (e) {
          console.warn('Could not get CSRF token');
        }
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type for FormData - browser will set it with boundary
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`${API_URL}/products/admin/new`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Update product with image file uploads
  updateProductWithImages: async (productId: string, formData: FormData, token: string) => {
    try {
      // Get CSRF token for the request
      let csrfToken = getCurrentCSRFToken();
      if (!csrfToken) {
        try {
          csrfToken = await getCSRFToken();
        } catch (e) {
          console.warn('Could not get CSRF token');
        }
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type for FormData - browser will set it with boundary
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`${API_URL}/products/admin/${productId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getAllOrders: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch all orders');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  deleteProduct: async (productId: string, token: string) => {
    try {
      const headers = await getHeaders(false, '');
      headers['Authorization'] = `Bearer ${token}`;

      const response = await apiFetch(`${API_URL}/products/admin/${productId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  updateProduct: async (productId: string, productData: any, token: string) => {
    try {
      const headers = await getHeaders(false);
      headers['Authorization'] = `Bearer ${token}`;

      const response = await apiFetch(`${API_URL}/products/admin/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getReviewsByProductId: async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/reviews/product/${encodeURIComponent(productId)}`, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch reviews');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Reviews
  createReview: async (data: { productId: string; rating: number; comment: string; userName?: string }, token?: string) => {
    try {
      // Get CSRF token for the request
      let csrfToken = getCurrentCSRFToken();
      if (!csrfToken) {
        try {
          csrfToken = await getCSRFToken();
        } catch {
          console.warn('Could not get CSRF token for review');
        }
      }

      const response = await fetch(`${API_URL}/reviews/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create review');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Wishlist
  getWishlist: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch wishlist');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  addToWishlistApi: async (productId: string, token: string) => {
    try {
      const headers = await getHeaders(false);
      headers['Authorization'] = `Bearer ${token}`;

      const response = await apiFetch(`${API_URL}/wishlist/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to wishlist');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  removeFromWishlistApi: async (productId: string, token: string) => {
    try {
      const headers = await getHeaders(false);
      headers['Authorization'] = `Bearer ${token}`;

      const response = await apiFetch(`${API_URL}/wishlist/remove`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove from wishlist');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  checkWishlist: async (productId: string, token: string) => {
    try {
      const response = await fetch(`${API_URL}/wishlist/check/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check wishlist');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Shared Wishlist
  createSharedWishlist: async (data: { title?: string; message?: string; expiresInDays?: number }, token: string) => {
    try {
      const response = await fetch(`${API_URL}/wishlist/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create shared wishlist');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getSharedWishlist: async (shareId: string) => {
    try {
      const response = await fetch(`${API_URL}/wishlist/shared/${shareId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Shared wishlist not found');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  getMySharedWishlists: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/wishlist/shared`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch shared wishlists');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  deleteSharedWishlist: async (shareId: string, token: string) => {
    try {
      // Get CSRF token for the request
      let csrfToken = getCurrentCSRFToken();
      if (!csrfToken) {
        try {
          csrfToken = await getCSRFToken();
        } catch (e) {
          console.warn('Could not get CSRF token');
        }
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`${API_URL}/wishlist/shared/${shareId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete shared wishlist');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Discount
  validateDiscountCode: async (data: { code: string; orderAmount: number }) => {
    try {
      const response = await fetch(`${API_URL}/discount/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to validate discount code');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Payment
  createPaymentOrder: async (data: { amount: number; currency?: string }, token: string) => {
    try {
      const response = await fetch(`${API_URL}/payment/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment order');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  verifyPayment: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }, token: string) => {
    try {
      const response = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify payment');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Orders
  getOrderById: async (orderId: string, token: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch order');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Admin
  updateOrderStatus: async (orderId: string, newStatus: string, token: string) => {
    try {
      // Get CSRF token for the request
      let csrfToken = getCurrentCSRFToken();
      if (!csrfToken) {
        try {
          csrfToken = await getCSRFToken();
        } catch (e) {
          console.warn('Could not get CSRF token');
        }
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`${API_URL}/orders/admin/${orderId}`, {
        method: "PUT",
        headers,
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Failed to update order status: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Server did not return JSON.');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  updateProductStatus: async (productId: string, newStatus: string, token: string) => {
    const response = await fetch(`${API_URL}/products/${productId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update product status: ${response.statusText}`);
    }
    return await response.json();
  },

  // Admin - User Management
  getAllUsers: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to fetch users');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: string, token: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to update user role');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  deleteUser: async (userId: string, token: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to delete user');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Admin - Get order details
  getOrderDetails: async (orderId: string, token: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/admin/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to fetch order details');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Public - Track order (no auth required)
  trackOrder: async (orderNumber: string, email?: string) => {
    try {
      const params = new URLSearchParams({ orderNumber });
      if (email) params.append('email', email);

      const response = await fetch(`${API_URL}/orders/track?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Order not found');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Download order invoice PDF
  downloadInvoice: async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to download invoice');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `invoice-${orderId}.pdf`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Referral System
  getMyReferralCode: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/referral/code`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to get referral code');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  getReferralStats: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/referral/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to get referral stats');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  validateReferralCode: async (code: string) => {
    try {
      const response = await fetch(`${API_URL}/referral/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Invalid referral code');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  getRefereeDiscount: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/referral/discount`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to check referral discount');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  calculateReferralDiscount: async (orderAmount: number, token: string) => {
    try {
      const response = await fetch(`${API_URL}/referral/calculate-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ orderAmount })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to calculate referral discount');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  }
};
