"use client"
import React, { useState, useEffect } from 'react';
import { User, Package, Heart, MapPin, LogOut, ChevronRight, Settings, Bell, CreditCard, ShieldCheck, X, Plus, Check, Gift } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Address } from '../types';
import { useToast } from '@/hooks/useToast';
import { LoyaltyWidget } from './LoyaltyWidget';
import { OrderTracking } from './OrderTracking';
import LoadingSpinner from './LoadingSpinner';

 
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
      <div className="flex items-center justify-center h-screen">
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
    <div className="min-h-screen pb-20 bg-muted/20">
      {/* Account Header Banner */}
      <div className="pt-12 pb-24 bg-primary">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="flex flex-col items-center gap-8 text-white md:flex-row">
            <div className="relative group">
              <div className="relative flex items-center justify-center w-32 h-32 p-1 overflow-hidden bg-white border-4 rounded-full shadow-2xl border-white/20">
                <User size={64} className="text-primary" />
                <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 cursor-pointer bg-black/40 group-hover:opacity-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tight">Bonjour, {user?.name?.split(' ')[0] || 'Guest'}!</h1>
              <p className="italic opacity-80">Managing your signature beauty choices since 2026</p>
              <div className="flex flex-wrap justify-center gap-4 pt-2 md:justify-start">
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

      <div className="container px-4 mx-auto -mt-12 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Navigation Sidebar */}
          <aside className="space-y-6 lg:col-span-1">
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
                      <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                    </div>
                    {activeTab !== tab.id && <ChevronRight size={14} className="transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />}
                  </button>
                ))}

                <div className="mx-4 my-4 border-t border-border" />

                <button
                  onClick={() => logout()}
                  className="flex items-center w-full gap-3 px-6 py-4 text-sm font-bold transition-all rounded-2xl text-destructive hover:bg-destructive/5"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>

            {/* Support Widget */}
            <div className="bg-secondary rounded-[2.5rem] p-8 space-y-4 border border-accent/30">
              <h4 className="font-bold tracking-tight text-primary">Need Beauty Advice?</h4>
              <p className="text-xs italic leading-relaxed text-foreground/70">Our consultants are available 24/7 to help you choose the right products for your skin type.</p>
              <button className="w-full py-3 text-xs font-bold tracking-widest uppercase transition-all bg-white border rounded-full shadow-sm text-primary hover:shadow-md border-primary/10">Chat with Expert</button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="duration-500 lg:col-span-3 min-h-150 animate-in fade-in slide-in-from-right">
            {/* Orders Section */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-8">
                <div className="flex items-end justify-between pb-6 border-b border-border">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Purchase Chronicles</h2>
                    <p className="text-sm text-muted-foreground">Review and track your beauty orders</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="py-20 space-y-6 text-center">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full opacity-50 bg-secondary text-primary">
                      <Package size={40} />
                    </div>
                    <p className="italic text-muted-foreground">Thy beauty vault is currently empty of orders.</p>
                    <Link
                      href="/shop"
                      className="inline-block px-10 py-4 font-bold text-white transition-all rounded-full shadow-lg bg-primary hover:bg-primary/90 shadow-primary/10"
                    >
                      Browse Boutique
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="overflow-hidden transition-all border border-border rounded-4xl group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-muted/30">
                          <div className="flex gap-8">
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Order Ref</p>
                              <p className="font-bold tracking-tight text-foreground">#{order.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Dating From</p>
                              <p className="font-bold tracking-tight text-foreground">
                                {new Date(order.createdAt).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Value</p>
                              <p className="font-extrabold tracking-tight text-primary">₹{order.total}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-tighter border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="p-8 space-y-6">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-6">
                              <div className="relative w-20 h-20 overflow-hidden shadow-sm rounded-2xl shrink-0 bg-muted">
                                <Image
                                  src={item.product.images?.[0] || item.product.image || ""}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <h4 className="font-bold text-foreground">{item.product.name}</h4>
                                <div className="flex gap-4 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                                  <span>Quantity: {item.quantity}</span>
                                  <span>•</span>
                                  <span>Category: {item.product.category}</span>
                                </div>
                              </div>
                              <Link href={`/product/${item.product.slug}`} className="p-3 transition-all rounded-full bg-muted text-foreground hover:bg-primary hover:text-white">
                                <ChevronRight size={18} />
                              </Link>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-4 p-6 bg-white border-t shadow-inner border-border">
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
                <div className="flex flex-col items-center justify-between gap-6 pb-8 border-b sm:flex-row border-border">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Wishlist Gallery</h2>
                    <p className="text-sm text-muted-foreground">Your favorite selections ready for acquisition</p>
                  </div>
                  <button className="px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-full shadow-sm bg-secondary text-primary hover:shadow-md">
                    Add All to Cart
                  </button>
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-8 rounded-full opacity-50 bg-secondary text-primary animate-pulse">
                      <Heart size={48} />
                    </div>
                    <p className="px-4 mb-10 text-lg italic text-muted-foreground text-balance">Your heart has not claimed any treasures yet.</p>
                    <Link
                      href="/shop"
                      className="inline-flex px-12 py-5 font-bold text-white transition-all rounded-full shadow-xl bg-primary hover:bg-primary/90 shadow-primary/20"
                    >
                      Start Designing Your Routine
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex flex-col items-center justify-between gap-6 pb-8 border-b sm:flex-row border-border">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Delivery Destinations</h2>
                    <p className="text-sm text-muted-foreground">Manage your global shipping locations</p>
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
                    className="flex items-center gap-2 px-8 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all rounded-full shadow-lg bg-primary shadow-primary/20 hover:scale-105"
                  >
                    {showAddressForm && editingAddress === null ? <X size={16} /> : <Plus size={16} />}
                    {showAddressForm && editingAddress === null ? 'Cancel' : 'Add New Abode'}
                  </button>
                </div>

                {/* Address Form Modal/Inline */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="p-8 mb-8 duration-300 border bg-secondary/30 rounded-2xl border-primary/20 animate-in fade-in slide-in-from-top">
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
                        className="p-2 transition-all text-muted-foreground hover:text-destructive"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Full Name</label>
                        <input
                          type="text"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-6 py-4 font-medium transition-all bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Street Address</label>
                        <input
                          type="text"
                          required
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                          placeholder="123 Main Street"
                          className="w-full px-6 py-4 font-medium transition-all bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Apartment/Suite (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                          placeholder="Apt 4B"
                          className="w-full px-6 py-4 font-medium transition-all bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">City</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="Mumbai"
                          className="w-full px-6 py-4 font-medium transition-all bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">State</label>
                        <input
                          type="text"
                          required
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="Maharashtra"
                          className="w-full px-6 py-4 font-medium transition-all bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          placeholder="400001"
                          className="w-full px-6 py-4 font-medium transition-all bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Phone Line</label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full px-6 py-4 font-medium transition-all bg-white border border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-2 md:col-span-2">
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
                        className="flex-1 py-4 font-bold transition-all border-2 rounded-full border-border text-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 py-4 font-bold text-white transition-all rounded-full shadow-lg flex-2 bg-primary hover:bg-primary/90 shadow-primary/20"
                      >
                        <Check size={18} />
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="px-8 py-20 text-center border-2 border-dashed bg-muted/20 rounded-4xl border-border">
                    <p className="italic text-muted-foreground">No destinations saved in your registry yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white border-2 border-border rounded-[2.5rem] p-8 space-y-6 relative group hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-foreground">{addr.name}</h3>
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
                          <p className="font-medium leading-relaxed text-foreground/80">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            <br />
                            {addr.city}, {addr.state} - <span className="font-bold text-foreground">{addr.pincode}</span>
                          </p>
                          <div className="flex items-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
                            <span className="p-1 px-2 rounded bg-muted">PHONE: {addr.phone}</span>
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
              <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-bottom">
                <div className="grid gap-10 md:grid-cols-2">
                  {/* Identity Form */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b border-border">
                      <User className="text-primary" size={24} />
                      <h2 className="text-2xl font-bold tracking-tight">Identity Details</h2>
                    </div>
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Legal Name</label>
                        <input type="text" defaultValue={user.name} className="w-full px-6 py-4 font-medium transition-all border border-transparent bg-muted rounded-2xl focus:outline-none focus:bg-white focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Email Registry</label>
                        <input type="email" defaultValue={user.email} className="w-full px-6 py-4 font-medium transition-all border border-transparent bg-muted rounded-2xl focus:outline-none focus:bg-white focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="px-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">Communication Line</label>
                        <input type="tel" defaultValue={user.phone} className="w-full px-6 py-4 font-medium transition-all border border-transparent bg-muted rounded-2xl focus:outline-none focus:bg-white focus:border-primary" />
                      </div>
                      <button type="submit" className="w-full py-5 font-bold text-white transition-all rounded-full shadow-xl bg-foreground hover:bg-black shadow-black/10">Save Persona Updates</button>
                    </form>
                  </div>

                  <div className="space-y-10">
                    {/* Loyalty Points Widget */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm">
                      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                        <Gift className="text-primary" size={24} />
                        <h2 className="text-2xl font-bold tracking-tight">Loyalty Rewards</h2>
                      </div>
                      <LoyaltyWidget />
                    </div>

                    {/* Security Widget */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <ShieldCheck className="text-primary" size={24} />
                        <h2 className="text-2xl font-bold tracking-tight">Security</h2>
                      </div>
                      <p className="text-sm italic text-muted-foreground">Maintain your vault security by updating your passphrase regularly.</p>
                      <button className="w-full py-4 text-xs font-bold tracking-widest uppercase transition-all border-2 rounded-full border-border text-foreground hover:bg-muted">Reset Password</button>
                    </div>

                    {/* Preferences Widget */}
                    <div className="bg-secondary p-1 rounded-[2.5rem] border border-primary/10 overflow-hidden shadow-sm">
                      <div className="bg-white rounded-[2.3rem] p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                          <Bell className="text-primary" size={24} />
                          <h2 className="text-xl font-bold tracking-tight">Alert Preferences</h2>
                        </div>
                        <div className="space-y-4">
                          {['Sale Announcements', 'New Signature Arrivals', 'Luxe Rewards Updates'].map((pref) => (
                            <label key={pref} className="flex items-center justify-between cursor-pointer group">
                              <span className="text-sm font-medium transition-colors text-foreground/80 group-hover:text-primary">{pref}</span>
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
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                  {[
                    { icon: CreditCard, val: "₹15,400", label: "Lifetime Lush" },
                    { icon: Heart, val: "24", label: "Desired Items" },
                    { icon: Package, val: "12", label: "Orders Fulfilled" },
                    { icon: ShieldCheck, val: "Level 4", label: "Security Tier" }
                  ].map((stat, i) => (
                    <div key={i} className="p-8 space-y-3 text-center transition-all duration-500 bg-white border shadow-sm rounded-4xl border-primary/5 group hover:bg-primary">
                      <div className="flex items-center justify-center w-10 h-10 mx-auto transition-all rounded-full bg-secondary text-primary group-hover:bg-white/20 group-hover:text-white">
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold tracking-tight text-foreground group-hover:text-white">{stat.val}</p>
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

