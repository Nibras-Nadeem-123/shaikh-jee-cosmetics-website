"use client"
import React, { useState, useEffect } from 'react';
import { User, Package, Heart, MapPin, LogOut, ChevronRight, Settings, Bell, CreditCard, ShieldCheck, X, Plus, Check, Gift, Share2, Sparkles, Crown, Star, Truck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Address } from '../types';
import { useToast } from '@/hooks/useToast';
import { LoyaltyWidget } from './LoyaltyWidget';
import LoadingSpinner from './LoadingSpinner';
import { apiService } from '@/services/api';
import { WishlistShareModal } from './WishlistShareModal';


export const AccountPage = () => {
  const { user, logout, orders, wishlist, addresses, addAddress, updateAddress, deleteAddress } = useApp();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialTab = (searchParams.get('tab') as any) || 'profile';
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>(initialTab);
  const router = useRouter()

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  // Wishlist share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Update active tab when URL query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['orders', 'wishlist', 'addresses', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam as 'orders' | 'wishlist' | 'addresses' | 'profile');
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile Overview', icon: User },
    { id: 'orders' as const, label: 'Order History', icon: Package },
    { id: 'wishlist' as const, label: 'My Wishlist', icon: Heart },
    { id: 'addresses' as const, label: 'Shipping Addresses', icon: MapPin },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Address form handlers
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      updateAddress(editingAddress.id!, addressForm);
      showToast("Address updated successfully!", "success");
    } else {
      addAddress(addressForm);
      showToast("Address added successfully!", "success");
    }

    // Reset and close form
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      isDefault: false
    });
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone || '',
      isDefault: addr.isDefault || false
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to remove this address?')) {
      deleteAddress(id);
      showToast("Address removed", "info");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Account Header Banner */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 pt-16 pb-32 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />

        {/* Floating Icons */}
        <div className="absolute top-10 left-[10%] animate-bounce" style={{ animationDelay: '0.1s' }}>
          <Sparkles className="w-5 h-5 text-white/30" />
        </div>
        <div className="absolute top-20 right-[15%] animate-bounce" style={{ animationDelay: '0.3s' }}>
          <Crown className="w-6 h-6 text-white/25" />
        </div>
        <div className="absolute bottom-20 left-[20%] animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Star className="w-4 h-4 text-white/30" />
        </div>
        <div className="absolute bottom-16 right-[25%] animate-bounce" style={{ animationDelay: '0.7s' }}>
          <Heart className="w-5 h-5 text-white/25" />
        </div>

        <div className="container px-4 mx-auto lg:px-8 relative z-10">
          <div className="flex flex-col items-center gap-8 text-white md:flex-row">
            {/* Avatar */}
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <User size={56} className="text-white relative z-10" />
                <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 cursor-pointer bg-black/40 group-hover:opacity-100 rounded-full">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                </div>
              </div>
              {/* Crown Badge */}
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50">
                <Crown size={18} className="text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-3 text-center md:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 backdrop-blur-sm">
                <Star size={12} className="text-yellow-300" />
                VIP Member
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Welcome, {user?.name?.split(' ')[0] || 'Guest'}!
              </h1>
              <p className="text-white/70 text-lg">Your personalized beauty dashboard</p>
              <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 flex items-center gap-2">
                  <Crown size={14} className="text-yellow-300" />
                  Gold Tier
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 flex items-center gap-2">
                  <Gift size={14} className="text-pink-300" />
                  1,250 Points
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z" fill="rgb(253 242 248)" />
          </svg>
        </div>
      </div>

      <div className="container px-4 mx-auto -mt-16 lg:px-8 pb-20 relative z-10">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Navigation Sidebar */}
          <aside className="space-y-6 lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-pink-500/5 border border-pink-100 overflow-hidden sticky top-28">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl transition-all group ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                      : 'text-muted-foreground hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:text-pink-600'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={18} />
                      <span className="text-sm font-bold">{tab.label}</span>
                    </div>
                    {activeTab !== tab.id && <ChevronRight size={14} className="transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />}
                  </button>
                ))}

                <div className="mx-4 my-4 border-t border-pink-100" />

                <button
                  onClick={() => logout()}
                  className="flex items-center w-full gap-3 px-5 py-4 text-sm font-bold transition-all rounded-xl text-red-500 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>

            {/* Support Widget */}
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-[2rem] p-6 space-y-4 border border-pink-200">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="text-pink-500" size={24} />
              </div>
              <h4 className="font-bold text-foreground">Need Beauty Advice?</h4>
              <p className="text-sm text-muted-foreground">Our consultants are available 24/7 to help you choose the right products.</p>
              <button className="w-full py-3 text-sm font-bold transition-all bg-white border border-pink-200 rounded-full text-pink-600 hover:shadow-lg hover:shadow-pink-500/10 hover:border-pink-300">
                Chat with Expert
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 animate-in fade-in slide-in-from-right duration-500">
            {/* Orders Section */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-pink-100 shadow-xl shadow-pink-500/5 space-y-8">
                <div className="flex items-end justify-between pb-6 border-b border-pink-100">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Order History</h2>
                    <p className="text-sm text-muted-foreground">Track and manage your beauty orders</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="py-20 space-y-6 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-100 to-purple-100">
                      <Package size={40} className="text-pink-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">No orders yet</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">Start your beauty journey by exploring our collection</p>
                    </div>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105"
                    >
                      Browse Shop
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="overflow-hidden transition-all border border-pink-100 rounded-2xl group hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10">
                        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-r from-pink-50 to-purple-50">
                          <div className="flex flex-wrap gap-6">
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                              <p className="font-bold text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                              <p className="font-bold text-foreground">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                              <p className="font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">Rs.{order.total}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="p-6 space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-xl border border-pink-100">
                              <div className="relative w-16 h-16 overflow-hidden rounded-xl shrink-0 bg-white shadow-sm">
                                <Image
                                  src={item.product.images?.[0] || item.product.image || ""}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground truncate">{item.product.name}</h4>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} • {item.product.category}</p>
                              </div>
                              <Link href={`/product/${item.product.slug}`} className="p-2 transition-all rounded-full bg-white border border-pink-100 text-pink-500 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent">
                                <ChevronRight size={16} />
                              </Link>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-3 p-4 bg-white border-t border-pink-100">
                          <button
                            onClick={async () => {
                              try {
                                showToast('Generating invoice...', 'info');
                                await apiService.downloadInvoice(order._id);
                                showToast('Invoice downloaded!', 'success');
                              } catch (error) {
                                showToast('Failed to download invoice', 'error');
                              }
                            }}
                            className="px-5 py-2.5 border border-pink-200 text-xs font-bold uppercase rounded-full hover:bg-pink-50 transition-all text-pink-600"
                          >
                            Download Invoice
                          </button>
                          <Link
                            href="/track-order"
                            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold uppercase rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-2"
                          >
                            <Truck size={14} />
                            Track Order
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Section */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-pink-100 shadow-xl shadow-pink-500/5 space-y-8">
                <div className="flex flex-col items-center justify-between gap-6 pb-6 border-b border-pink-100 sm:flex-row">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">My Wishlist</h2>
                    <p className="text-sm text-muted-foreground">Your favorite beauty picks</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      disabled={wishlist.length === 0}
                      className="flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase transition-all rounded-full border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                    <button className="px-5 py-3 text-xs font-bold tracking-wider uppercase transition-all rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40">
                      Add All to Cart
                    </button>
                  </div>
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100">
                      <Heart size={40} className="text-pink-400" />
                    </div>
                    <div className="space-y-2 mb-8">
                      <h3 className="text-xl font-bold text-foreground">Your wishlist is empty</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">Save your favorite products to buy them later</p>
                    </div>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105"
                    >
                      Explore Products
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Section */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-pink-100 shadow-xl shadow-pink-500/5 space-y-8">
                <div className="flex flex-col items-center justify-between gap-6 pb-6 border-b border-pink-100 sm:flex-row">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Shipping Addresses</h2>
                    <p className="text-sm text-muted-foreground">Manage your delivery locations</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        name: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        pincode: '',
                        phone: '',
                        isDefault: false
                      });
                      setShowAddressForm(!showAddressForm);
                    }}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105"
                  >
                    {showAddressForm && editingAddress === null ? <X size={16} /> : <Plus size={16} />}
                    {showAddressForm && editingAddress === null ? 'Cancel' : 'Add Address'}
                  </button>
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground">
                        {editingAddress ? 'Update Address' : 'Add New Address'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="p-2 transition-all text-muted-foreground hover:text-red-500 rounded-full hover:bg-white"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 font-medium transition-all bg-white border border-pink-100 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                          placeholder="123 Main Street"
                          className="w-full px-4 py-3 font-medium transition-all bg-white border border-pink-100 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Apartment/Suite (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                          placeholder="Apt 4B"
                          className="w-full px-4 py-3 font-medium transition-all bg-white border border-pink-100 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">City *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="Karachi"
                          className="w-full px-4 py-3 font-medium transition-all bg-white border border-pink-100 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">State/Province *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="Sindh"
                          className="w-full px-4 py-3 font-medium transition-all bg-white border border-pink-100 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Postal Code *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          placeholder="75500"
                          className="w-full px-4 py-3 font-medium transition-all bg-white border border-pink-100 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="+92 321 1234567"
                          className="w-full px-4 py-3 font-medium transition-all bg-white border border-pink-100 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-2 md:col-span-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-5 h-5 rounded-md border-pink-300 text-pink-500 focus:ring-pink-500"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-foreground">
                          Set as default address
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="flex-1 py-3 font-bold transition-all border border-pink-200 rounded-full text-foreground hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 py-3 font-bold text-white transition-all rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40"
                      >
                        <Check size={18} />
                        {editingAddress ? 'Update' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 && !showAddressForm ? (
                  <div className="py-16 text-center border-2 border-dashed border-pink-200 rounded-2xl bg-gradient-to-br from-pink-50/50 to-purple-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <MapPin className="text-pink-400" size={28} />
                    </div>
                    <p className="text-muted-foreground">No addresses saved yet. Add your first delivery address.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white border border-pink-100 rounded-2xl p-6 space-y-4 relative group hover:border-pink-300 transition-all hover:shadow-xl hover:shadow-pink-500/10">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-foreground">{addr.name}</h3>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 text-[10px] font-bold uppercase rounded-full tracking-wider border border-pink-200">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="p-2 bg-pink-50 rounded-lg text-pink-500 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white transition-all"
                            >
                              <Settings size={14} />
                            </button>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-muted-foreground leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            <br />
                            {addr.city}, {addr.state} - <span className="font-bold text-foreground">{addr.pincode}</span>
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 text-xs font-bold text-muted-foreground">
                              {addr.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Section */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Identity Form */}
                  <div className="bg-white rounded-[2rem] p-8 border border-pink-100 shadow-xl shadow-pink-500/5 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-pink-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <User className="text-pink-500" size={20} />
                      </div>
                      <h2 className="text-xl font-bold">Personal Information</h2>
                    </div>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Full Name</label>
                        <input type="text" defaultValue={user.name} className="w-full px-4 py-3 font-medium transition-all bg-gradient-to-br from-pink-50/50 to-purple-50/50 border border-pink-100 rounded-xl focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Email Address</label>
                        <input type="email" defaultValue={user.email} className="w-full px-4 py-3 font-medium transition-all bg-gradient-to-br from-pink-50/50 to-purple-50/50 border border-pink-100 rounded-xl focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Phone Number</label>
                        <input type="tel" defaultValue={user.phone} placeholder="+92 XXX XXXXXXX" className="w-full px-4 py-3 font-medium transition-all bg-gradient-to-br from-pink-50/50 to-purple-50/50 border border-pink-100 rounded-xl focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20" />
                      </div>
                      <button type="submit" className="w-full py-4 font-bold text-white transition-all rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02]">
                        Save Changes
                      </button>
                    </form>
                  </div>

                  <div className="space-y-6">
                    {/* Loyalty Points Widget */}
                    <div className="bg-white rounded-[2rem] p-8 border border-pink-100 shadow-xl shadow-pink-500/5">
                      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-pink-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                          <Gift className="text-orange-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Loyalty Rewards</h2>
                      </div>
                      <LoyaltyWidget />
                    </div>

                    {/* Security Widget */}
                    <div className="bg-white rounded-[2rem] p-8 border border-pink-100 shadow-xl shadow-pink-500/5 space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-pink-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="text-green-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Security</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">Keep your account secure by updating your password regularly.</p>
                      <button className="w-full py-3 text-sm font-bold transition-all border border-pink-200 rounded-full text-pink-600 hover:bg-pink-50">
                        Change Password
                      </button>
                    </div>

                    {/* Preferences Widget */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-1 rounded-[2rem] border border-pink-100 shadow-sm">
                      <div className="bg-white rounded-[1.8rem] p-6 space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-pink-100">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <Bell className="text-blue-500" size={20} />
                          </div>
                          <h2 className="text-lg font-bold">Notifications</h2>
                        </div>
                        <div className="space-y-3">
                          {['Sale Announcements', 'New Arrivals', 'Rewards Updates'].map((pref) => (
                            <label key={pref} className="flex items-center justify-between cursor-pointer group p-2 rounded-xl hover:bg-pink-50 transition-all">
                              <span className="text-sm font-medium text-foreground/80 group-hover:text-pink-600">{pref}</span>
                              <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-600"></div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { icon: CreditCard, val: `Rs.${(orders.reduce((sum, o) => sum + (o.total || 0), 0)).toLocaleString()}`, label: "Total Spent", gradient: "from-pink-500 to-rose-500" },
                    { icon: Heart, val: wishlist.length.toString(), label: "Wishlist Items", gradient: "from-red-500 to-pink-500" },
                    { icon: Package, val: orders.length.toString(), label: "Total Orders", gradient: "from-purple-500 to-indigo-500" },
                    { icon: MapPin, val: addresses.length.toString(), label: "Saved Addresses", gradient: "from-blue-500 to-cyan-500" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-pink-100 shadow-lg shadow-pink-500/5 space-y-3 text-center group hover:shadow-xl hover:shadow-pink-500/10 transition-all hover:scale-[1.02]">
                      <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                        <stat.icon size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stat.val}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Wishlist Share Modal */}
      <WishlistShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        wishlistCount={wishlist.length}
      />
    </div>
  );
};
