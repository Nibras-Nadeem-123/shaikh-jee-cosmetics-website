const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const loyaltyApi = {
  // Get user loyalty points
  getLoyaltyPoints: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/loyalty/points`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch loyalty points');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if backend is running.');
      }
      throw error;
    }
  },

  // Redeem points
  redeemPoints: async (points: number, token: string) => {
    try {
      const response = await fetch(`${API_URL}/loyalty/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to redeem points');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Get tier information
  getTierInfo: async () => {
    try {
      const response = await fetch(`${API_URL}/loyalty/tiers`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch tier info');
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server.');
      }
      throw error;
    }
  },

  // Award points (called after order completion)
  awardPoints: async (userId: string, orderId: string, orderAmount: number, token: string) => {
    try {
      const response = await fetch(`${API_URL}/loyalty/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, orderId, orderAmount })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to award points');
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
