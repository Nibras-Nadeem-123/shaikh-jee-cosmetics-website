"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, CheckCircle, AlertCircle, Package, Home, MapPin } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';

export default function OrderProcessPage() {
  const router = useRouter();
  const { user, cart, cartTotal, clearCart } = useApp();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<'checkout' | 'payment' | 'processing' | 'success'>('checkout');
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=order');
    }
    
    if (cart.length === 0 && step === 'checkout') {
      router.push('/cart');
    }
  }, [user, cart, router, step]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress.name || !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setStep('payment');
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create order
      const orderPayload = {
        orderItems: cart.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image,
          category: item.product.category
        })),
        shippingAddress,
        paymentMethod: 'Razorpay',
        totalPrice: cartTotal
      };
      
      // Create order API call
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      
      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || 'Failed to create order');
      }
      
      const orderData = await orderResponse.json();
      setOrderDetails(orderData.order);
      
      // For demo purposes, simulate successful payment
      // In production, integrate Razorpay here
      await simulatePayment();
      
    } catch (error) {
      console.error('Payment error:', error);
      showToast((error as Error).message, 'error');
      setPaymentLoading(false);
    }
  };

  const simulatePayment = async () => {
    setStep('processing');
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate webhook confirmation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStep('success');
    clearCart();
    setPaymentLoading(false);
  };

  const handleContinueShopping = () => {
    router.push('/shop');
  };

  const handleViewOrder = () => {
    router.push(`/account?tab=orders`);
  };

  // Checkout Step
  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-muted/20 py-12">
        <div className="container-custom">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                <span className="font-medium">Shipping</span>
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">2</div>
                <span className="font-medium">Payment</span>
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">3</div>
                <span className="font-medium">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Home className="w-6 h-6 text-primary" />
                  Shipping Address
                </h2>
                
                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        className="input-luxury"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="input-luxury"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                      className="input-luxury"
                      placeholder="House/Flat No., Building Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                      className="input-luxury"
                      placeholder="Street, Area, Landmark"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="input-luxury"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">State *</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="input-luxury"
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Pincode *</label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        className="input-luxury"
                        placeholder="400001"
                        pattern="[0-9]{6}"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary mt-8"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.product.image || '/placeholder.png'}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-semibold text-primary">₹{item.product.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{cartTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-muted/20 py-12">
        <div className="container-custom max-w-3xl">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <span className="font-medium">Shipping</span>
              </div>
              <div className="w-12 h-0.5 bg-primary"></div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                <span className="font-medium">Payment</span>
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">3</div>
                <span className="font-medium">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Payment Method
            </h2>

            <div className="space-y-6">
              {/* Payment Options */}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    defaultChecked
                    className="peer sr-only"
                  />
                  <div className="border-2 border-border rounded-xl p-6 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <CreditCard className="w-8 h-8 text-primary mb-3" />
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Rupay</p>
                  </div>
                </label>

                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    className="peer sr-only"
                  />
                  <div className="border-2 border-border rounded-xl p-6 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <Truck className="w-8 h-8 text-primary mb-3" />
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay on delivery</p>
                  </div>
                </label>
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-bold text-lg">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Address</span>
                  <span className="text-right">{shippingAddress.city}, {shippingAddress.state}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50"
              >
                {paymentLoading ? 'Processing...' : `Pay ₹${cartTotal}`}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                By clicking "Pay", you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing Step
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <CheckCircle className="absolute inset-0 m-auto w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Processing Your Order</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  // Success Step
  if (step === 'success' && orderDetails) {
    return (
      <div className="min-h-screen bg-muted/20 py-12">
        <div className="container-custom max-w-3xl">
          <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-8">Thank you for your purchase</p>

            <div className="bg-muted/50 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <p className="font-bold">#{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                  <p className="font-medium">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-bold text-primary">₹{orderDetails.totalPrice}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleViewOrder}
                className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all"
              >
                Track Order
              </button>
              <button
                onClick={handleContinueShopping}
                className="px-8 py-3 border border-primary text-primary rounded-full font-semibold hover:bg-primary/5 transition-all"
              >
                Continue Shopping
              </button>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              A confirmation email has been sent to your registered email address
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
