"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight, AlertCircle } from 'lucide-react';
import { OrderTracking } from '@/components/OrderTracking';
import { useToast } from '@/hooks/useToast';

// Mock order data for demo (in production, fetch from API)
const mockOrders: any = {
  'ORD-2026-001': {
    orderNumber: 'ORD-2026-001',
    orderStatus: 'shipped',
    estimatedDelivery: 'March 25, 2026',
    shippingAddress: {
      addressLine1: '123, Marine Drive, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002'
    },
    orderItems: [
      {
        name: 'Zeena - Glow Highlighter 010',
        quantity: 2,
        price: 849,
        image: 'https://highfy.pk/cdn/shop/files/publicpreview_239ac0bd-1182-4eee-b4bd-34753feb32b0.jpg?v=1749115740&width=1946'
      },
      {
        name: 'Habit - Matte Lipstick Red',
        quantity: 1,
        price: 599,
        image: 'https://highfy.pk/cdn/shop/files/publicpreview_239ac0bd-1182-4eee-b4bd-34753feb32b0.jpg?v=1749115740&width=1946'
      }
    ],
    tracking: [
      {
        status: 'Order Placed',
        timestamp: '2026-03-17T10:30:00Z',
        location: 'Mumbai'
      },
      {
        status: 'Processing',
        timestamp: '2026-03-17T14:00:00Z',
        location: 'Mumbai Warehouse'
      },
      {
        status: 'Shipped',
        timestamp: '2026-03-18T09:00:00Z',
        location: 'Mumbai Distribution Center'
      }
    ]
  },
  'ORD-2026-002': {
    orderNumber: 'ORD-2026-002',
    orderStatus: 'delivered',
    estimatedDelivery: 'March 15, 2026',
    shippingAddress: {
      addressLine1: '456, Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    orderItems: [
      {
        name: 'Skinory - Vitamin C Serum',
        quantity: 1,
        price: 1299,
        image: 'https://highfy.pk/cdn/shop/files/publicpreview_239ac0bd-1182-4eee-b4bd-34753feb32b0.jpg?v=1749115740&width=1946'
      }
    ],
    tracking: [
      {
        status: 'Order Placed',
        timestamp: '2026-03-10T11:00:00Z',
        location: 'Bangalore'
      },
      {
        status: 'Processing',
        timestamp: '2026-03-10T15:00:00Z',
        location: 'Bangalore Warehouse'
      },
      {
        status: 'Shipped',
        timestamp: '2026-03-11T10:00:00Z',
        location: 'Bangalore Distribution Center'
      },
      {
        status: 'Out for Delivery',
        timestamp: '2026-03-15T08:00:00Z',
        location: 'Bangalore'
      },
      {
        status: 'Delivered',
        timestamp: '2026-03-15T14:30:00Z',
        location: 'Bangalore'
      }
    ]
  }
};

export default function TrackOrderPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if order exists in mock data
      const foundOrder = mockOrders[orderNumber.toUpperCase()];

      if (foundOrder) {
        setOrder(foundOrder);
        showToast('Order found!', 'success');
      } else {
        setError('Order not found. Please check your order number.');
        showToast('Order not found', 'error');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      showToast('Failed to track order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTrack = (orderNum: string) => {
    setOrderNumber(orderNum);
    setOrder(mockOrders[orderNum]);
    showToast('Order loaded!', 'success');
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-luxury py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your order number to track your package in real-time
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom -mt-8">
        <div className="max-w-4xl mx-auto">
          {/* Track Order Form */}
          <div className="bg-card rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Order Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      placeholder="ORD-2026-XXX"
                      className="input-luxury pl-12"
                      required
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={orderEmail}
                    onChange={(e) => setOrderEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-luxury"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional - for additional verification
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !orderNumber.trim()}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Package className="w-5 h-5 animate-spin" />
                    Tracking Order...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Track Order
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-destructive-light border border-destructive/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Order Not Found</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            {/* Demo Orders */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-3">Try demo orders:</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleQuickTrack('ORD-2026-001')}
                  className="px-4 py-2 bg-muted hover:bg-primary/10 text-foreground hover:text-primary rounded-full text-sm font-medium transition-all border border-border hover:border-primary/50"
                >
                  ORD-2026-001 (Shipped)
                </button>
                <button
                  onClick={() => handleQuickTrack('ORD-2026-002')}
                  className="px-4 py-2 bg-muted hover:bg-primary/10 text-foreground hover:text-primary rounded-full text-sm font-medium transition-all border border-border hover:border-primary/50"
                >
                  ORD-2026-002 (Delivered)
                </button>
              </div>
            </div>
          </div>

          {/* Order Tracking Display */}
          {order && (
            <div className="animate-fade-in">
              <OrderTracking order={order} />
              
              {/* Need Help Section */}
              <div className="mt-8 bg-card rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-muted/50 rounded-xl">
                    <h4 className="font-semibold mb-2">Contact Support</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have questions about your order? Our support team is here to help.
                    </p>
                    <a
                      href="mailto:support@shaikhjee.com"
                      className="text-primary font-medium hover:underline text-sm"
                    >
                      support@shaikhjee.com
                    </a>
                  </div>
                  
                  <div className="p-6 bg-muted/50 rounded-xl">
                    <h4 className="font-semibold mb-2">Call Us</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Speak directly with our customer care team.
                    </p>
                    <a
                      href="tel:+91-9876543210"
                      className="text-primary font-medium hover:underline text-sm"
                    >
                      +91-9876543210
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">
                      Mon-Sat, 10AM-7PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!order && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                No Order Selected
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Enter your order number above or try one of our demo orders to see tracking information
              </p>
              <button
                onClick={() => router.push('/account?tab=orders')}
                className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all"
              >
                View My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
