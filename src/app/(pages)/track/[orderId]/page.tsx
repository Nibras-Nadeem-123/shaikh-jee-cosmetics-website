"use client"
import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, AlertCircle, Home, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderStep {
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  title: string;
  description: string;
  date?: string;
  icon: React.ReactNode;
}

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const [orderId, setOrderId] = useState(params.orderId);
  const [loading, setLoading] = useState(false);

  // Mock order data - In production, fetch from API
  const order = {
    id: orderId,
    status: 'shipped',
    total: 1499,
    shippingAddress: {
      name: 'John Doe',
      addressLine1: '123 Beauty Street',
      addressLine2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    items: [
      {
        product: {
          id: '1',
          name: 'Velvet Matte Lipstick',
          image: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10',
          price: 899,
        },
        quantity: 1,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
  };

  const steps: OrderStep[] = [
    {
      status: 'delivered',
      title: 'Order Placed',
      description: 'Your order has been successfully placed',
      date: order.createdAt.toLocaleDateString('en-GB'),
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
    {
      status: 'processing',
      title: 'Processing',
      description: 'Your order is being prepared',
      date: order.createdAt.toLocaleDateString('en-GB'),
      icon: <Package className="w-6 h-6" />,
    },
    {
      status: 'shipped',
      title: 'Shipped',
      description: 'Your order is on its way to you',
      date: order.shippedAt?.toLocaleDateString('en-GB'),
      icon: <Truck className="w-6 h-6" />,
    },
    {
      status: 'pending',
      title: 'Out for Delivery',
      description: `Estimated delivery by ${order.estimatedDelivery?.toLocaleDateString('en-GB')}`,
      icon: <Clock className="w-6 h-6" />,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const currentStepIndex = steps.findIndex(step =>
    order.status === 'delivered' ? step.status === 'delivered' :
    order.status === 'shipped' ? step.status === 'shipped' :
    order.status === 'processing' ? step.status === 'processing' :
    step.status === 'pending'
  );

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20">
            <Package size={14} />
            Order Tracking
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Track Your Order</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Order #{orderId} • Real-time updates for your luxury beauty treasures
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/10 sticky top-28">
              <h2 className="text-xl font-bold text-foreground tracking-tight mb-6">Order Details</h2>

              <div className="space-y-6">
                {/* Status */}
                <div className="p-4 rounded-2xl bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Current Status</h3>
                  </div>
                  <p className={`px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </p>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    Shipping To
                  </h3>
                  <div className="space-y-1 text-sm text-foreground/80">
                    <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - <span className="font-bold text-foreground">{order.shippingAddress.pincode}</span></p>
                  </div>
                </div>

                {/* Order Date */}
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Order Timeline
                  </h3>
                  <p className="text-sm text-foreground/80">
                    Placed on {order.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <button className="w-full py-3 border-2 border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2">
                    <Printer size={16} />
                    Print Invoice
                  </button>
                  <button className="w-full py-3 border-2 border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2">
                    <Download size={16} />
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/10">
              <h2 className="text-xl font-bold text-foreground tracking-tight mb-8">Delivery Progress</h2>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-8 w-0.5 bg-border" />

                {/* Steps */}
                <div className="space-y-8 relative">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={index} className="flex items-start gap-6 relative">
                        {/* Step Circle */}
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            z-10 transition-all duration-300
                            ${isCompleted
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-white border-2 border-border text-muted-foreground'
                            }
                            ${isCurrent ? 'scale-110' : ''}
                          `}
                        >
                          {step.icon}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-bold text-lg ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                              {step.title}
                            </h3>
                            {step.date && (
                              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isCompleted ? 'bg-muted/50' : 'bg-border'}`}>
                                {step.date}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isCompleted ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-12 p-6 bg-secondary/50 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Estimated Delivery</h3>
                </div>
                <p className="text-lg font-bold text-primary">
                  {order.estimatedDelivery?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  Your package should arrive within 2-3 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/10">
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-8">Items in This Order</h2>

            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-6 p-6 bg-muted/20 rounded-2xl items-center">
                  <div className="w-24 h-24 relative rounded-2xl overflow-hidden shadow-md shrink-0 bg-muted">
                    <Image
                      src={item.product.image || ''}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg">{item.product.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-foreground/70 mt-1">
                      <span>Quantity: {item.quantity}</span>
                      <span>•</span>
                      <span>Price: ₹{item.product.price}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹{item.product.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-8 pt-8 border-t-2 border-dashed border-border">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-foreground">Order Total</span>
                <span className="text-3xl font-bold text-primary tracking-tight">₹{order.total}</span>
              </div>
              <p className="text-sm text-foreground/70 text-center mt-2">
                Includes all taxes and shipping charges
              </p>
            </div>
          </div>
        </div>

        {/* Back to Account Button */}
        <div className="mt-12 text-center">
          <Link
            href="/account"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-foreground font-bold rounded-full hover:bg-muted border-2 border-border transition-all shadow-lg"
          >
            <Home size={20} />
            Back to My Account
          </Link>
        </div>
      </div>
    </div>
  );
}
