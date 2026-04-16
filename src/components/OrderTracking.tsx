"use client";

import React from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar } from 'lucide-react';

interface OrderTrackingProps {
  order: {
    orderNumber: string;
    orderStatus: string;
    estimatedDelivery?: string;
    shippingAddress: {
      addressLine1: string;
      city: string;
      state: string;
      pincode: string;
    };
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    tracking?: Array<{
      status: string;
      timestamp: string;
      location?: string;
    }>;
  };
}

const orderStatusSteps = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'out-for-delivery', label: 'Out for Delivery', icon: MapPin },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export function OrderTracking({ order }: OrderTrackingProps) {
  const currentStatusIndex = orderStatusSteps.findIndex(s => s.status === order.orderStatus);

  return (
    <div className="space-y-8">
      {/* Order Status Timeline */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Order Status</h3>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted hidden md:block">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStatusIndex / (orderStatusSteps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Status Steps */}
          <div className="relative flex justify-between">
            {orderStatusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${isCompleted
                        ? 'bg-primary border-primary text-white'
                        : 'bg-background border-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium hidden md:block ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status */}
        {order.orderStatus !== 'delivered' && order.estimatedDelivery && (
          <div className="mt-6 p-4 bg-primary/10 rounded-xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-lg font-bold text-primary">{order.estimatedDelivery}</p>
            </div>
          </div>
        )}
      </div>

      {/* Shipping Address */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Shipping Address
        </h3>
        <div className="text-muted-foreground">
          <p className="font-medium text-foreground">{order.shippingAddress.addressLine1}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.orderItems.map((item, index) => (
            <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                <p className="font-semibold text-primary mt-1">₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking History */}
      {order.tracking && order.tracking.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Tracking History</h3>
          <div className="space-y-4">
            {order.tracking.map((track, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'
                    }`} />
                  {index < order.tracking!.length - 1 && (
                    <div className="w-0.5 h-full bg-muted mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">{track.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(track.timestamp).toLocaleString()}
                  </p>
                  {track.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {track.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
