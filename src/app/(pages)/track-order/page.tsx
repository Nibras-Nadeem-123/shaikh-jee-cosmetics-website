"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight, AlertCircle, CheckCircle2, Truck, Clock, MapPin, Sparkles, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { apiService } from '@/services/api';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />

        {/* Floating Icons */}
        <div className="absolute top-10 left-[15%] animate-bounce" style={{ animationDelay: '0.1s' }}>
          <Package className="w-6 h-6 text-white/30" />
        </div>
        <div className="absolute top-20 right-[20%] animate-bounce" style={{ animationDelay: '0.3s' }}>
          <Sparkles className="w-5 h-5 text-white/40" />
        </div>
        <div className="absolute bottom-10 left-[25%] animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Truck className="w-7 h-7 text-white/30" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-6">
              <Truck size={14} />
              Real-Time Tracking
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Track Your Order
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto">
              Enter your order number to see real-time updates on your beauty package
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z" fill="rgb(253 242 248)" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto -mt-8">
          {/* Track Order Form */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-pink-500/10 p-8 md:p-10 mb-8 border border-pink-100">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                    Order Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      placeholder="ORD-XXXXX-XXXX or Order ID"
                      className="w-full pl-12 pr-4 py-4 border border-pink-100 bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium"
                      required
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 px-1">
                    Find this in your order confirmation email
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={orderEmail}
                    onChange={(e) => setOrderEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-4 border border-pink-100 bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium"
                  />
                  <p className="text-xs text-muted-foreground mt-2 px-1">
                    Optional - for additional verification
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !orderNumber.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-pink-500/25 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tracking Order...
                  </>
                ) : (
                  <>
                    Track Order
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-red-700">Order Not Found</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Tracking Display */}
          {order && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
              {/* Order Header */}
              <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-500/5 p-8 border border-pink-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Order Number</p>
                    <h2 className="text-2xl font-bold text-foreground">
                      {order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-6 py-3 rounded-full text-sm font-bold uppercase flex items-center gap-2 border ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    {order.orderStatus?.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                  <div className="flex justify-between mb-2">
                    {statusSteps.slice(0, -1).map((step, index) => (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          index <= getCurrentStepIndex(order.orderStatus)
                            ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index < getCurrentStepIndex(order.orderStatus) ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className="text-[10px] mt-2 text-center font-bold uppercase tracking-wider capitalize hidden md:block text-muted-foreground">
                          {step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        order.orderStatus === 'delivered'
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.orderStatus === 'delivered' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          6
                        )}
                      </div>
                      <span className="text-[10px] mt-2 font-bold uppercase tracking-wider hidden md:block text-muted-foreground">Delivered</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500 rounded-full"
                      style={{ width: `${(getCurrentStepIndex(order.orderStatus) / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-500/5 p-6 border border-pink-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-pink-500" />
                    </div>
                    <h3 className="font-bold text-lg">Shipping Address</h3>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-bold text-foreground text-base">{order.shippingAddress?.name}</p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    <p className="font-bold text-foreground">{order.shippingAddress?.pincode}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-500/5 p-6 border border-pink-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="font-bold text-lg">Order Summary</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Total</span>
                      <span className="font-medium">Rs.{order.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={`font-medium ${order.shippingPrice === 0 ? 'text-green-600' : ''}`}>
                        {order.shippingPrice === 0 ? 'FREE' : `Rs.${order.shippingPrice}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-dashed">
                      <span>Total</span>
                      <span className="text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text">
                        Rs.{order.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-500/5 p-6 border border-pink-100">
                <h3 className="font-bold text-lg mb-6">Order Items ({order.orderItems?.length || 0})</h3>
                <div className="space-y-4">
                  {order.orderItems?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-2xl border border-pink-100">
                      <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
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
                        <p className="font-bold text-lg">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-500/5 p-6 border border-pink-100">
                  <h3 className="font-bold text-lg mb-6">Tracking History</h3>
                  <div className="space-y-4">
                    {order.statusHistory.slice().reverse().map((history: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${index === 0 ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-muted'}`} />
                        <div className="flex-1">
                          <p className="font-bold capitalize">{history.status?.replace(/_/g, ' ')}</p>
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
              <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-500/5 p-8 border border-pink-100">
                <h3 className="text-xl font-bold mb-6">Need Help?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Mail size={20} className="text-pink-500" />
                      </div>
                      <h4 className="font-bold">Email Support</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Have questions about your order? Our support team is here to help.
                    </p>
                    <a href="mailto:support@shaikhjee.com" className="text-primary font-bold hover:underline text-sm">
                      support@shaikhjee.com
                    </a>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Phone size={20} className="text-purple-500" />
                      </div>
                      <h4 className="font-bold">Call Us</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Speak directly with our customer care team.
                    </p>
                    <a href="tel:+92-321-1234567" className="text-primary font-bold hover:underline text-sm">
                      +92 321 1234567
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">Mon-Sat, 10AM-7PM PKT</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!order && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Ready to Track?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Enter your order number above to see real-time tracking information for your beauty order
              </p>
              <Link
                href="/account?tab=orders"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold hover:shadow-xl hover:shadow-pink-500/25 hover:scale-105 transition-all duration-300"
              >
                View My Orders
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
