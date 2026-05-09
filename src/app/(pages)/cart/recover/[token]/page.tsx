"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import CdnImage from '@/components/CdnImage';
import Link from 'next/link';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    image?: string;
  };
  quantity: number;
  shade?: {
    name: string;
    color: string;
  };
}

interface RecoveryCartResponse {
  success: boolean;
  cart: {
    items: CartItem[];
    total: number;
    count: number;
  };
  recovered?: boolean;
  merged?: boolean;
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CartRecoveryPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { user, addToCart } = useApp();

  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<RecoveryCartResponse['cart'] | null>(null);
  const [recovered, setRecovered] = useState(false);
  const [alreadyRecovered, setAlreadyRecovered] = useState(false);

  // Fetch the abandoned cart details
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`${API_URL}/cart/recover/${token}`, {
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load cart');
        }

        setCart(data.cart);
        setAlreadyRecovered(data.recovered || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCart();
    }
  }, [token]);

  // Handle cart recovery
  const handleRecover = async () => {
    setRecovering(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Include auth token if user is logged in
      const authToken = localStorage.getItem('token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/cart/recover/${token}`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });

      const data: RecoveryCartResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to recover cart');
      }

      setRecovered(true);

      // If user is not logged in, add items to local cart
      if (!user && cart?.items) {
        for (const item of cart.items) {
          addToCart(item.product as any, item.quantity, item.shade as any);
        }
      }

      // Redirect to cart page after a short delay
      setTimeout(() => {
        router.push('/cart');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recover cart');
    } finally {
      setRecovering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (recovered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cart Recovered!</h1>
          <p className="text-gray-600 mb-4">Your items have been restored to your cart.</p>
          <p className="text-sm text-gray-500">Redirecting to your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {alreadyRecovered ? 'Cart Already Recovered' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600">
            {alreadyRecovered
              ? 'This cart has already been recovered. You can still view the items below.'
              : 'We saved your cart for you. Ready to complete your purchase?'}
          </p>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Your Items ({cart?.count || 0})</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {cart?.items.map((item, index) => (
              <div key={index} className="p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <CdnImage
                    src={item.product?.images?.[0] || item.product?.image || '/placeholder.png'}
                    alt={item.product?.name || 'Product'}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder.png"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.product?.name || 'Product'}
                  </h3>
                  {item.shade && (
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: item.shade.color }}
                      />
                      {item.shade.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    Rs. {((item.product?.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-primary">
                Rs. {(cart?.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!alreadyRecovered && (
            <button
              onClick={handleRecover}
              disabled={recovering}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {recovering ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Recover Cart & Checkout
                </>
              )}
            </button>
          )}
          <Link
            href="/shop"
            className={`flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-200 rounded-full font-semibold hover:border-primary hover:text-primary transition-colors ${alreadyRecovered ? 'flex-1' : ''}`}
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Login prompt for guests */}
        {!user && !alreadyRecovered && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-blue-800 text-sm">
              <Link href="/login" className="font-semibold underline">Sign in</Link> to save your cart and enjoy a faster checkout experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
