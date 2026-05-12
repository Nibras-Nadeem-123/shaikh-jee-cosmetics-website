"use client"
import React from 'react';
import { Trash2, ShoppingBag, ChevronRight, ArrowLeft, ShieldCheck, Minus, Plus, Sparkles, Truck, Gift, CreditCard, Tag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useApp();
  const { showToast } = useToast();

  const shipping = cartTotal >= 1500 ? 0 : 150;
  const discount = 0;
  const total = cartTotal + shipping - discount;
  const freeShippingThreshold = 1500;
  const progressToFreeShipping = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/50 via-white to-purple-50/30">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-md mx-auto text-center space-y-8 animate-in fade-in duration-500">
            {/* Empty Cart Illustration */}
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-pink-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-800">Your Cart is Empty</h2>
              <p className="text-gray-500 text-lg">
                Looks like you haven't added anything yet. Discover our premium beauty collection.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full hover:shadow-xl hover:shadow-pink-500/25 transition-all hover:-translate-y-0.5"
            >
              Start Shopping
              <ChevronRight size={20} />
            </Link>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: ShieldCheck, label: 'Secure Payment' },
                { icon: Gift, label: 'Easy Returns' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-pink-50 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-pink-500" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 via-white to-purple-50/30">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium flex items-center justify-center gap-2">
            <Truck className="w-4 h-4" />
            Free shipping on orders over Rs. 1,500!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.product._id}-${item.selectedShade?._id || 'default'}`}
                className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-pink-50 hover:shadow-lg hover:shadow-pink-500/5 transition-all group"
              >
                <div className="flex gap-4 lg:gap-6">
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative w-24 h-28 lg:w-32 lg:h-40 rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 shrink-0"
                  >
                    <Image
                      src={item.product.images?.[0] || item.product.image || "/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {item.product.discount && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full">
                        -{item.product.discount}%
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
                            {item.product.category}
                          </span>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="block text-base lg:text-lg font-semibold text-gray-800 hover:text-pink-500 transition-colors line-clamp-2 mt-1"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item.product._id, item.selectedShade?._id);
                            showToast("Item removed from cart", "info");
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {item.selectedShade && (
                        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-gray-50 rounded-full">
                          <div
                            className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                            style={{ backgroundColor: item.selectedShade.color }}
                          />
                          <span className="text-xs font-medium text-gray-600">{item.selectedShade.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3 mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-50 rounded-full p-1">
                        <button
                          onClick={() => updateCartQuantity(item.product._id, item.quantity - 1, item.selectedShade?._id)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product._id, item.quantity + 1, item.selectedShade?._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                          Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">Rs. {item.product.price.toLocaleString()} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Promo Code Section */}
            <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-pink-50">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-5 h-5 text-pink-500" />
                <span className="font-semibold text-gray-800">Have a promo code?</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 transition-all"
                />
                <button className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-pink-500/5 border border-pink-100 sticky top-24 overflow-hidden">
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <p className="text-white/80 text-sm mt-1">{cart.length} items</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Free Shipping Progress */}
                {cartTotal < freeShippingThreshold && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Free shipping progress</span>
                      <span className="font-semibold text-pink-500">
                        Rs. {(freeShippingThreshold - cartTotal).toLocaleString()} away
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressToFreeShipping}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">Rs. {cartTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-emerald-500">FREE</span>
                    ) : (
                      <span className="font-semibold text-gray-800">Rs. {shipping}</span>
                    )}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">-Rs. {discount}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Rs. {total.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Includes all taxes</p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Continue Shopping */}
                <Link
                  href="/shop"
                  className="w-full py-3 border-2 border-pink-100 text-pink-500 font-semibold rounded-xl hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="pt-4 flex items-center justify-center gap-6 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs">Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span className="text-xs">Fast Delivery</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="pt-2 flex items-center justify-center gap-3">
                  <div className="h-6 px-2 bg-gray-100 rounded flex items-center justify-center">
                    <Image src="/visa.svg" alt="Visa" width={28} height={16} className="h-3 w-auto" />
                  </div>
                  <div className="h-6 px-2 bg-gray-100 rounded flex items-center justify-center">
                    <Image src="/mastercard.svg" alt="Mastercard" width={28} height={16} className="h-4 w-auto" />
                  </div>
                  <div className="h-6 px-2 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-500">UPI</span>
                  </div>
                  <div className="h-6 px-3 bg-emerald-100 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold text-emerald-600">COD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
