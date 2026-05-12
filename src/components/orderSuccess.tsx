"use client"
import React from 'react';
import { CheckCircle, Package, Home, Sparkles, Truck, Clock, Mail, ArrowRight, Gift, ShoppingBag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

const OrderSuccessPage = () => {
  const { orders } = useApp();
  const latestOrder = orders[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      {/* Floating Sparkles */}
      <div className="absolute top-20 left-[20%] animate-bounce">
        <Sparkles className="w-6 h-6 text-pink-300" />
      </div>
      <div className="absolute top-40 right-[15%] animate-bounce" style={{ animationDelay: '0.2s' }}>
        <Sparkles className="w-4 h-4 text-green-300" />
      </div>
      <div className="absolute bottom-40 left-[15%] animate-bounce" style={{ animationDelay: '0.4s' }}>
        <Sparkles className="w-5 h-5 text-purple-300" />
      </div>
      <div className="absolute top-60 right-[30%] animate-bounce" style={{ animationDelay: '0.6s' }}>
        <Gift className="w-5 h-5 text-pink-400" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            {/* Success Icon */}
            <div className="relative inline-flex mb-8">
              <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 animate-in zoom-in duration-500">
                <CheckCircle size={56} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Gift size={20} className="text-white" />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 mb-6 border border-green-200">
              <CheckCircle size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">Order Confirmed</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Your beauty essentials are on their way. We can't wait for you to experience them!
            </p>
          </div>

          {/* Order Details Card */}
          {latestOrder && (
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-pink-500/10 border border-pink-100 overflow-hidden mb-8 animate-in slide-in-from-bottom duration-500">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Order Number</p>
                    <p className="text-2xl font-bold tracking-tight">#{latestOrder._id || latestOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-3xl font-bold tracking-tight">Rs.{latestOrder.total || latestOrder.totalPrice}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-8 space-y-6">
                {/* Info Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-5 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Truck size={20} className="text-pink-500" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery Address</p>
                    </div>
                    <p className="text-foreground font-medium leading-relaxed">
                      {latestOrder.shippingAddress?.name && <span className="font-bold block">{latestOrder.shippingAddress.name}</span>}
                      {latestOrder.shippingAddress?.addressLine1}, {latestOrder.shippingAddress?.city},{' '}
                      {latestOrder.shippingAddress?.state} - {latestOrder.shippingAddress?.pincode}
                    </p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Clock size={20} className="text-green-500" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Expected Delivery</p>
                    </div>
                    <p className="text-foreground font-bold text-lg">5-7 Business Days</p>
                    <p className="text-muted-foreground text-sm mt-1">We'll notify you when shipped</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-5 bg-muted/30 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Package size={20} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payment Method</p>
                        <p className="text-foreground font-bold capitalize">{latestOrder.paymentMethod}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider border border-green-200">
                      {latestOrder.paymentStatus || 'Confirmed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              href="/track-order"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-300"
            >
              <Package size={20} />
              <span>Track Your Order</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-pink-200 text-foreground font-bold rounded-full shadow-lg hover:border-pink-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Home size={20} className="text-pink-500" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Email Notification */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Mail size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">Confirmation Email Sent</h3>
              <p className="text-muted-foreground text-sm">
                We've sent a confirmation email with order details to your registered email address.
                Please check your inbox and spam folder.
              </p>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Continue exploring our collection</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              <ShoppingBag size={18} />
              Browse More Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="url(#gradient)" fillOpacity="0.1"/>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="0">
              <stop stopColor="#22c55e" />
              <stop offset="0.5" stopColor="#a855f7" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
