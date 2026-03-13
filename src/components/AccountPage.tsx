"use client"
import React, { useState, useEffect } from 'react';
import { User, Package, Heart, MapPin, LogOut, ChevronRight, Settings, Bell, CreditCard, ShieldCheck, X, Plus, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Address } from '../types';
import { useToast } from '@/hooks/useToast';

import { LoadingSpinner } from './LoadingSpinner';

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
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
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Account Header Banner */}
      <div className="bg-primary pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-white">
            <div className="relative group">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center p-1 border-4 border-white/20 shadow-2xl relative overflow-hidden">
                <User size={64} className="text-primary" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Bonjour, {user?.name?.split(' ')[0] || 'Guest'}!</h1>
              <p className="opacity-80 italic">Managing your signature beauty choices since 2026</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                  Member Tier: Gold
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                  Points: 1250
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-primary/5 border border-primary/10 overflow-hidden sticky top-28">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl transition-all group ${activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={20} />
                      <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                    </div>
                    {activeTab !== tab.id && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
                  </button>
                ))}

                <div className="my-4 border-t border-border mx-4" />

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-destructive font-bold hover:bg-destructive/5 transition-all text-sm"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>

            {/* Support Widget */}
            <div className="bg-secondary rounded-[2.5rem] p-8 space-y-4 border border-accent/30">
              <h4 className="font-bold text-primary tracking-tight">Need Beauty Advice?</h4>
              <p className="text-xs text-foreground/70 leading-relaxed italic">Our consultants are available 24/7 to help you choose the right products for your skin type.</p>
              <button className="w-full py-3 bg-white text-primary font-bold rounded-full text-xs shadow-sm hover:shadow-md transition-all uppercase tracking-widest border border-primary/10">Chat with Expert</button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 min-h-150 animate-in fade-in slide-in-from-right duration-500">
            {/* Orders Section */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-8">
                <div className="flex justify-between items-end border-b border-border pb-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Purchase Chronicles</h2>
                    <p className="text-muted-foreground text-sm">Review and track your beauty orders</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto text-primary opacity-50">
                      <Package size={40} />
                    </div>
                    <p className="text-muted-foreground italic">Thy beauty vault is currently empty of orders.</p>
                    <Link
                      href="/shop"
                      className="inline-block px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                    >
                      Browse Boutique
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border rounded-4xl overflow-hidden group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="bg-muted/30 p-6 flex flex-wrap justify-between items-center gap-4">
                          <div className="flex gap-8">
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Order Ref</p>
                              <p className="font-bold text-foreground tracking-tight">#{order.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Dating From</p>
                              <p className="font-bold text-foreground tracking-tight">
                                {new Date(order.createdAt).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Value</p>
                              <p className="font-extrabold text-primary tracking-tight">₹{order.total}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-tighter border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="p-8 space-y-6">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-6 items-center">
                              <div className="w-20 h-20 relative rounded-2xl overflow-hidden shadow-sm shrink-0 bg-muted">
                                <Image
                                  src={item.product.images?.[0] || item.product.image || ""}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <h4 className="font-bold text-foreground">{item.product.name}</h4>
                                <div className="flex gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  <span>Quantity: {item.quantity}</span>
                                  <span>•</span>
                                  <span>Category: {item.product.category}</span>
                                </div>
                              </div>
                              <Link href={`/product/${item.product.slug}`} className="p-3 bg-muted rounded-full text-foreground hover:bg-primary hover:text-white transition-all">
                                <ChevronRight size={18} />
                              </Link>
                            </div>
                          ))}
                        </div>

                        <div className="p-6 bg-white border-t border-border flex justify-end gap-4 shadow-inner">
                          <button className="px-6 py-2.5 border-2 border-border text-xs font-bold uppercase rounded-full hover:bg-muted transition-all">Invoice</button>
                          <button className="px-8 py-2.5 bg-foreground text-white text-xs font-bold uppercase rounded-full hover:bg-black transition-all">Re-order Luxe</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Section */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-border pb-8">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Wishlist Gallery</h2>
                    <p className="text-muted-foreground text-sm">Your favorite selections ready for acquisition</p>
                  </div>
                  <button className="px-8 py-4 bg-secondary text-primary font-bold rounded-full text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                    Add All to Cart
                  </button>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto text-primary opacity-50 mb-8 animate-pulse">
                      <Heart size={48} />
                    </div>
                    <p className="text-lg text-muted-foreground italic mb-10 text-balance px-4">Your heart has not claimed any treasures yet.</p>
                    <Link
                      href="/shop"
                      className="inline-flex px-12 py-5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                      Start Designing Your Routine
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {wishlist.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Section */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-border pb-8">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Delivery Destinations</h2>
                    <p className="text-muted-foreground text-sm">Manage your global shipping locations</p>
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
                    className="px-8 py-4 bg-primary text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    {showAddressForm && editingAddress === null ? <X size={16} /> : <Plus size={16} />}
                    {showAddressForm && editingAddress === null ? 'Cancel' : 'Add New Abode'}
                  </button>
                </div>

                {/* Address Form Modal/Inline */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="mb-8 bg-secondary/30 p-8 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground">
                        {editingAddress ? 'Update Destination' : 'Add New Destination'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                          placeholder="123 Main Street"
                          className="w-full px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Apartment/Suite (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                          placeholder="Apt 4B"
                          className="w-full px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">City</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="Mumbai"
                          className="w-full px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">State</label>
                        <input
                          type="text"
                          required
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="Maharashtra"
                          className="w-full px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          placeholder="400001"
                          className="w-full px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Phone Line</label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-5 h-5 rounded text-primary focus:ring-primary"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-foreground">
                          Set as default shipping destination
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="flex-1 py-4 border-2 border-border text-foreground font-bold rounded-full hover:bg-muted transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-2 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="text-center py-20 px-8 bg-muted/20 rounded-4xl border-2 border-dashed border-border">
                    <p className="text-muted-foreground italic">No destinations saved in your registry yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white border-2 border-border rounded-[2.5rem] p-8 space-y-6 relative group hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-foreground text-lg">{addr.name}</h3>
                              {addr.isDefault && (
                                <span className="px-3 py-1 bg-secondary text-primary text-[10px] font-bold uppercase rounded-full tracking-widest border border-primary/10">Default</span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Residential Identity</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="p-2.5 bg-muted rounded-full text-foreground hover:bg-primary hover:text-white transition-all"
                            >
                              <Settings size={14} />
                            </button>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-2.5 bg-muted rounded-full text-foreground hover:bg-destructive hover:text-white transition-all"
                              >
                                <LogOut size={14} className="rotate-90" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-foreground/80 leading-relaxed font-medium">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            <br />
                            {addr.city}, {addr.state} - <span className="font-bold text-foreground">{addr.pincode}</span>
                          </p>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold pt-2">
                            <span className="p-1 px-2 bg-muted rounded">PHONE: {addr.phone}</span>
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
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="grid md:grid-cols-2 gap-10">
                  {/* Identity Form */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 border-b border-border pb-6">
                      <User className="text-primary" size={24} />
                      <h2 className="text-2xl font-bold tracking-tight">Identity Details</h2>
                    </div>
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Legal Name</label>
                        <input type="text" defaultValue={user.name} className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email Registry</label>
                        <input type="email" defaultValue={user.email} className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Communication Line</label>
                        <input type="tel" defaultValue={user.phone} className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium" />
                      </div>
                      <button type="submit" className="w-full py-5 bg-foreground text-white font-bold rounded-full hover:bg-black transition-all shadow-xl shadow-black/10">Save Persona Updates</button>
                    </form>
                  </div>

                  <div className="space-y-10">
                    {/* Security Widget */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 border-b border-border pb-4">
                        <ShieldCheck className="text-primary" size={24} />
                        <h2 className="text-2xl font-bold tracking-tight">Security</h2>
                      </div>
                      <p className="text-sm text-muted-foreground italic">Maintain your vault security by updating your passphrase regularly.</p>
                      <button className="w-full py-4 border-2 border-border text-foreground font-bold rounded-full text-xs uppercase tracking-widest hover:bg-muted transition-all">Reset Password</button>
                    </div>

                    {/* Preferences Widget */}
                    <div className="bg-secondary p-1 rounded-[2.5rem] border border-primary/10 overflow-hidden shadow-sm">
                      <div className="bg-white rounded-[2.3rem] p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <Bell className="text-primary" size={24} />
                          <h2 className="text-xl font-bold tracking-tight">Alert Preferences</h2>
                        </div>
                        <div className="space-y-4">
                          {['Sale Announcements', 'New Signature Arrivals', 'Luxe Rewards Updates'].map((pref) => (
                            <label key={pref} className="flex items-center justify-between group cursor-pointer">
                              <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">{pref}</span>
                              <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Activity / Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { icon: CreditCard, val: "₹15,400", label: "Lifetime Lush" },
                    { icon: Heart, val: "24", label: "Desired Items" },
                    { icon: Package, val: "12", label: "Orders Fulfilled" },
                    { icon: ShieldCheck, val: "Level 4", label: "Security Tier" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-4xl border border-primary/5 shadow-sm text-center space-y-3 group hover:bg-primary transition-all duration-500">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mx-auto text-primary group-hover:bg-white/20 group-hover:text-white transition-all">
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground group-hover:text-white tracking-tight">{stat.val}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-white/70">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

