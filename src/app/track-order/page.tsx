"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight, AlertCircle, CheckCircle2, Truck, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { apiService } from '@/services/api';
import Image from 'next/image';

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
      const data = await apiService.trackOrder(orderNumber.trim(), orderEmail.trim() || undefined);

      if (data.success && data.order) {
        setOrder(data.order);
        showToast('Order found!', 'success');
      } else {
        setError('Order not found. Please check your order number.');
        showToast('Order not found', 'error');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5" />;
      case 'shipped':
      case 'out_for_delivery': return <Truck className="w-5 h-5" />;
      case 'processing':
      case 'confirmed': return <Package className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

  const getCurrentStepIndex = (status: string) => {
    const index = statusSteps.indexOf(status?.toLowerCase());
    return index >= 0 ? index : 0;
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/30 to-primary/5 py-16">
        <div className="container mx-auto px-4">
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

      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-4xl mx-auto">
          {/* Track Order Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
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
                      placeholder="ORD-XXXXX-XXXX or Order ID"
                      className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in your order confirmation email
                  </p>
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
                    className="w-full px-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional - for additional verification
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !orderNumber.trim()}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
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
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Order Not Found</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Tracking Display */}
          {order && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
              {/* Order Header */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Order {order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`}</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-6 py-3 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    {order.orderStatus?.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                  <div className="flex justify-between mb-2">
                    {statusSteps.slice(0, -1).map((step, index) => (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index <= getCurrentStepIndex(order.orderStatus)
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index < getCurrentStepIndex(order.orderStatus) ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className="text-[10px] mt-2 text-center font-medium capitalize hidden md:block">
                          {step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        order.orderStatus === 'delivered'
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.orderStatus === 'delivered' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          6
                        )}
                      </div>
                      <span className="text-[10px] mt-2 font-medium hidden md:block">Delivered</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(getCurrentStepIndex(order.orderStatus) / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Address
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">{order.shippingAddress?.name}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    <p className="font-medium">{order.shippingAddress?.pincode}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Order Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Total</span>
                      <span>₹{order.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">₹{order.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-6">Order Items ({order.orderItems?.length || 0})</h3>
                <div className="space-y-4">
                  {order.orderItems?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{item.name}</p>
                        {item.selectedShade?.name && (
                          <p className="text-xs text-muted-foreground">Shade: {item.selectedShade.name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-lg mb-6">Tracking History</h3>
                  <div className="space-y-4">
                    {order.statusHistory.slice().reverse().map((history: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className="flex-1">
                          <p className="font-semibold capitalize">{history.status?.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{history.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(history.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {history.location && ` • ${history.location}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Need Help Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold mb-2">Contact Support</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have questions about your order? Our support team is here to help.
                    </p>
                    <a href="mailto:support@shaikhjee.com" className="text-primary font-medium hover:underline text-sm">
                      support@shaikhjee.com
                    </a>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold mb-2">Call Us</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Speak directly with our customer care team.
                    </p>
                    <a href="tel:+91-9876543210" className="text-primary font-medium hover:underline text-sm">
                      +91-9876543210
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">Mon-Sat, 10AM-7PM IST</p>
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
                Track Your Order
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Enter your order number above to see real-time tracking information for your order
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
