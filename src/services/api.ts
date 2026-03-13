const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiService = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
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

  signup: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
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
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to fetch products (Status: ${response.status})`);
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
        const response = await fetch(`${API_URL}/products/${slug}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch product');
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
        const response = await fetch(`${API_URL}/orders/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
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
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch orders');
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
        const response = await fetch(`${API_URL}/products/admin/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create product');
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
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch all orders');
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
        const response = await fetch(`${API_URL}/products/admin/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete product');
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
        const response = await fetch(`${API_URL}/reviews/product/${productId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch reviews');
        }
        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to server. Please check if backend is running.');
        }
        throw error;
    }
  }
};
