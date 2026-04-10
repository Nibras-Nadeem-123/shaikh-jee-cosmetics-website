const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const cartApi = {
  // Get cart
  getCart: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch cart');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Add to cart
  addToCart: async (productId: string, quantity: number, shade: any, token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity, shade })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (productId: string, quantity: number, shade: any, token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity, shade })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update cart');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Remove from cart
  removeFromCart: async (productId: string, shade: any, token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, shade })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove from cart');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Clear cart
  clearCart: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear cart');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Merge cart (on login)
  mergeCart: async (items: any[], token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to merge cart');
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
