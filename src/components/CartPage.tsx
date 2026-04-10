"use client"
import React from 'react';
import { Trash2, ShoppingBag, ChevronRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useApp();
  const { showToast } = useToast();

  const shipping = cartTotal >= 999 ? 0 : 99;
  const discount = 0;
  const total = cartTotal + shipping - discount;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-md mx-auto text-center space-y-6 animate-in fade-in scale-in duration-500">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto text-primary">
            <ShoppingBag size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Your Cart is Empty</h2>
            <p className="text-muted-foreground mt-2">Looks like you haven't added anything yet. Discover our premium beauty collection.</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Start Shopping
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground italic">{cart.length} items in your basket</p>
          </div>
          <Link href="/shop" className="text-primary font-bold flex items-center gap-2 hover:underline transition-all">
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-sm border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {cart.map((item) => (
                  <div
                    key={`${item.product._id}-${item.selectedShade?._id || 'default'}`}
                    className="p-8 group hover:bg-secondary/10 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-8">
                      {/* Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="w-32 h-40 relative rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all bg-muted shrink-0"
                      >
                        <Image
                          src={item.product.images?.[0] || item.product.image || ""}
                          alt={item.product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <Link
                              href={`/product/${item.product.slug}`}
                              className="text-xl font-bold text-foreground hover:text-primary transition-colors pr-8"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => {
                                removeFromCart(item.product._id, item.selectedShade?._id);
                                showToast("Item removed from cart", "info");
                              }}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                              title="Remove item"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">{item.product.category}</p>

                          {item.selectedShade && (
                            <div className="flex items-center gap-2 mb-4 bg-muted w-fit px-3 py-1 rounded-full border border-border">
                              <div
                                className="w-3 h-3 rounded-full shadow-inner shadow-black/20"
                                style={{ backgroundColor: item.selectedShade.color }}
                              />
                              <span className="text-xs font-medium text-foreground">{item.selectedShade.name}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-muted rounded-full p-1 border border-border shadow-sm">
                            <button
                              onClick={() => updateCartQuantity(item.product._id, item.quantity - 1, item.selectedShade?._id)}
                              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all text-foreground active:scale-95"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-bold text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product._id, item.quantity + 1, item.selectedShade?._id)}
                              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all text-foreground active:scale-95"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground tracking-tight">₹{item.product.price * item.quantity}</p>
                            <p className="text-xs text-muted-foreground font-medium">₹{item.product.price} / item</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 p-8 border border-primary/10 sticky top-28 space-y-8 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
              <h2 className="text-2xl font-bold text-foreground tracking-tight pb-4 border-b border-border">Checkout Details</h2>

              <div className="space-y-5">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Cart Subtotal</span>
                  <span className="text-foreground font-bold">₹{cartTotal}</span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground font-medium">
                  <div className="flex flex-col">
                    <span>Shipping Charges</span>
                    {shipping === 0 && <span className="text-[10px] text-primary font-bold uppercase">Free for orders over ₹999</span>}
                  </div>
                  <span className={shipping === 0 ? "text-primary font-bold italic" : "text-foreground font-bold"}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-destructive font-bold">
                    <span>Campaign Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                {cartTotal < 999 && (
                  <div className="p-4 bg-secondary/50 border border-primary/20 text-primary-dark text-xs rounded-2xl font-medium leading-relaxed">
                    🌟 Add items worth <span className="font-bold underline">₹{999 - cartTotal}</span> more to get <span className="font-bold">FREE</span> delivery!
                  </div>
                )}
              </div>

              <div className="py-6 border-t border-dashed border-border">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-foreground">Total Payable</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary tracking-tighter">₹{total}</span>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Includes all taxes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Link
                  href="/checkout"
                  className="w-full py-5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Proceed to Payment
                  <ChevronRight size={20} />
                </Link>

                <Link
                  href="/shop"
                  className="w-full py-4 border-2 border-border text-muted-foreground font-bold rounded-full hover:bg-muted hover:text-foreground transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Add More Items
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 py-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">100% Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
