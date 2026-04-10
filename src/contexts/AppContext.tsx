/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, User, Address, Order, Product, Shade } from '@/types';
import { apiService } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';


interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, shade?: Shade) => void;
  removeFromCart: (productId: string, shadeId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, shadeId?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  syncWishlist: () => Promise<void>;
  user: User | null;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  orders: Order[];
  createOrder: (orderData: any) => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync wishlist with database when user logs in
  const syncWishlist = async () => {
    if (!token) {
      // If no token, keep localStorage wishlist
      return;
    }

    try {
      const data = await apiService.getWishlist(token);
      if (data.products) {
        setWishlist(data.products);
      }
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');

    console.log('Saved token:', savedToken);
    console.log('Saved user:', savedUser);
    console.log('Saved cart:', savedCart);

    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    setLoading(false);
    console.log('Loading state set to false');
  }, []);

  // Sync wishlist when token becomes available
  useEffect(() => {
    if (token && !loading) {
      syncWishlist();
    }
  }, [token, loading]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const data = await apiService.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiService.signup({ name, email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null); // Correctly set user to null on logout
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCart([]);
  };

  const addToCart = (product: Product, quantity = 1, shade?: Shade) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product._id === product._id && item.selectedShade?._id === shade?._id);
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id && item.selectedShade?._id === shade?._id
            ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity, selectedShade: shade }];
    });
  };

  const removeFromCart = (productId: string, shadeId?: string) => {
    setCart(prev => prev.filter(item => !(item.product._id === productId && item.selectedShade?._id === shadeId)));
  };

  const updateCartQuantity = (productId: string, quantity: number, shadeId?: string) => {
    if (quantity <= 0) return removeFromCart(productId, shadeId);
    setCart(prev => prev.map(item =>
      item.product._id === productId && item.selectedShade?._id === shadeId ? { ...item, quantity } : item
    ));
  };

  const createOrder = async (orderData: any) => {
    if (!token) throw new Error('Authentication required');
    try {
      const data = await apiService.createOrder(orderData, token);
      if (data.success) {
        setOrders(prev => [data.order, ...prev]);
        setCart([]);
      }
    } catch (error) {
      console.error('Order error:', error);
      throw error;
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToWishlist = async (product: Product) => {
    if (token) {
      try {
        await apiService.addToWishlistApi(product._id, token);
        setWishlist(prev => [...prev.filter(p => p._id !== product._id), product]);
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
        throw error;
      }
    } else {
      setWishlist(prev => [...prev.filter(p => p._id !== product._id), product]);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (token) {
      try {
        await apiService.removeFromWishlistApi(productId, token);
        setWishlist(prev => prev.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        throw error;
      }
    } else {
      setWishlist(prev => prev.filter(p => p._id !== productId));
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart: () => setCart([]),
    cartTotal,
    cartCount,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist: (id: string) => wishlist.some(p => p._id === id),
    syncWishlist,
    user,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
    addresses,
    addAddress: (a: any) => setAddresses(prev => [...prev, { ...a, id: uuidv4() }]),
    updateAddress: (id: string, a: any) => setAddresses(prev => prev.map(x => x.id === id ? { ...x, ...a } : x)),
    deleteAddress: (id: string) => setAddresses(prev => prev.filter(x => x.id !== id)),
    orders,
    createOrder,
    isAdmin: user?.role === 'admin',
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
