"use client"
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, AlertCircle, Home, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/useToast';

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await apiService.trackOrder(params.orderId);
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order details');
        showToast(err.message || 'Order not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId]);

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

  const steps = [
    { status: 'pending', title: 'Order Placed', description: 'Your order has been successfully placed', icon: <CheckCircle2 className="w-6 h-6" /> },
    { status: 'confirmed', title: 'Confirmed', description: 'Order confirmed by seller', icon: <CheckCircle2 className="w-6 h-6" /> },
    { status: 'processing', title: 'Processing', description: 'Your order is being prepared', icon: <Package className="w-6 h-6" /> },
    { status: 'shipped', title: 'Shipped', description: 'Your order is on its way', icon: <Truck className="w-6 h-6" /> },
    { status: 'out_for_delivery', title: 'Out for Delivery', description: 'Your order will arrive today', icon: <Truck className="w-6 h-6" /> },
    { status: 'delivered', title: 'Delivered', description: 'Order has been delivered', icon: <CheckCircle2 className="w-6 h-6" /> },
  ];

  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStepIndex = order ? statusOrder.indexOf(order.orderStatus?.toLowerCase()) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground">{error || 'We could not find the order you are looking for. Please check the order number and try again.'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/track-order" className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all">
              Track Another Order
            </Link>
            <Link href="/account" className="px-6 py-3 border-2 border-border rounded-full font-semibold hover:bg-muted transition-all">
              Go to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Order {order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-8 pb-16">
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
                  <p className={`px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-sm inline-block ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus?.replace(/_/g, ' ')}
                  </p>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Shipping To
                  </h3>
                  <div className="space-y-1 text-sm text-foreground/80">
                    <p className="font-medium text-foreground">{order.shippingAddress?.name}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    <p className="font-bold text-foreground">{order.shippingAddress?.pincode}</p>
                  </div>
                </div>

                {/* Order Date */}
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Order Timeline
                  </h3>
                  <p className="text-sm text-foreground/80">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {order.deliveredAt && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Order Total */}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Items</span>
                    <span>₹{order.itemsPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                    <span>Total</span>
                    <span className="text-primary">₹{order.totalPrice?.toLocaleString()}</span>
                  </div>
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

                    // Find matching status history entry
                    const historyEntry = order.statusHistory?.find((h: any) => h.status === step.status);

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
                            {historyEntry && (
                              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isCompleted ? 'bg-muted/50' : 'bg-border'}`}>
                                {new Date(historyEntry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isCompleted ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                            {historyEntry?.description || step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/10">
              <h2 className="text-xl font-bold text-foreground tracking-tight mb-8">Items in This Order</h2>

              <div className="space-y-6">
                {order.orderItems?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-6 p-6 bg-muted/20 rounded-2xl items-center">
                    <div className="w-24 h-24 relative rounded-2xl overflow-hidden shadow-md shrink-0 bg-muted">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-foreground text-lg">{item.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-foreground/70 mt-1">
                        <span>Quantity: {item.quantity}</span>
                        <span>•</span>
                        <span>Price: ₹{item.price}</span>
                      </div>
                      {item.selectedShade?.name && (
                        <p className="text-sm text-muted-foreground mt-1">Shade: {item.selectedShade.name}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
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
