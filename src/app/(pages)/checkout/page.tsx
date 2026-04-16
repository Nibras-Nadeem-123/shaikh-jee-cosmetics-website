"use client"
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, CreditCard, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { AuthGuard } from '@/components/RoleGuard';

const CheckoutPage = () => {
    const { cart, cartTotal, createOrder, user, addresses } = useApp();
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });

    const shipping = cartTotal >= 999 ? 0 : 99;
    const total = cartTotal + shipping;

    const handlePlaceOrder = async () => {
        if (!formData.state) {
            alert('Please select a state before placing the order.');
            return;
        }

        try {
            await createOrder({
                items: cart,
                total,
                status: 'processing',
                shippingAddress: {
                    name: formData.name,
                    addressLine1: formData.addressLine1,
                    addressLine2: formData.addressLine2,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    phone: formData.phone,
                    email: formData.email
                },
                paymentMethod: 'COD'
            });
            router.push('/OrderSuccess');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing the order. Please try again.');
        }
    };

    const states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
        'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
        'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
        'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
        'West Virginia', 'Wisconsin', 'Wyoming'
    ];

    if (cart.length === 0) {
        return (
            <AuthGuard>
                <div className="container mx-auto px-4 py-32 text-center">
                    <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
                    <Link href="/shop" className="text-primary font-bold hover:underline">Return to Shop</Link>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-muted/20 py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Progress Bar */}
                    <div className="max-w-3xl mx-auto mb-12">
                        <div className="flex justify-between items-center relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />
                            <div className={`absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />

                            {[
                                { s: 1, icon: Truck, label: 'Shipping' },
                                { s: 2, icon: CreditCard, label: 'Payment' },
                                { s: 3, icon: CheckCircle2, label: 'Review' }
                            ].map((item) => (
                                <div key={item.s} className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${step >= item.s ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'}`}>
                                        <item.icon size={20} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${step >= item.s ? 'text-primary' : 'text-gray-400'}`}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            {step === 1 && (
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-primary/5 border border-primary/5 animate-in fade-in slide-in-from-left duration-500">
                                    <h2 className="text-3xl font-bold tracking-tight mb-8">Shipping Identity</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Street Address</label>
                                            <input
                                                type="text"
                                                value={formData.addressLine1}
                                                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                                placeholder="House number and street name"
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Postal Code</label>
                                            <input
                                                type="text"
                                                value={formData.pincode}
                                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Phone Line</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                        <select
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                            required
                                        >
                                            <option value="">Select a state</option>
                                            {states.map((state) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="mt-10 w-full py-5 bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                                    >
                                        Proceed to Payment
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-primary/5 border border-primary/5 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-bold tracking-tight mb-8">Settlement Method</h2>
                                    <div className="space-y-4">
                                        <div className="p-6 border-2 border-primary bg-primary/5 rounded-[2rem] flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                                                    <Truck size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">Cash on Delivery</p>
                                                    <p className="text-xs text-muted-foreground italic">Pay at your doorstep with grace</p>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 border-4 border-primary rounded-full bg-white" />
                                        </div>

                                        <div className="p-6 border-2 border-border rounded-[2rem] flex items-center justify-between opacity-50 cursor-not-allowed">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">Digital Transaction</p>
                                                    <p className="text-xs text-muted-foreground italic">Coming soon to the vault</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-10">
                                        <button onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-border text-foreground font-bold rounded-full">Back</button>
                                        <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/20">Review Order</button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-primary/5 border border-primary/5 animate-in fade-in zoom-in duration-500">
                                    <h2 className="text-3xl font-bold tracking-tight mb-8">Final Appraisal</h2>
                                    <div className="space-y-8">
                                        <div className="p-6 bg-muted/30 rounded-[2rem] border border-border">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Shipping Destination</h3>
                                            <p className="font-bold text-foreground">{formData.name}</p>
                                            <p className="text-sm text-foreground/80 leading-relaxed italic">
                                                {formData.addressLine1}, {formData.city}, {formData.state} - {formData.pincode}
                                            </p>
                                        </div>

                                        <div className="divide-y divide-border">
                                            {cart.map((item, idx) => (
                                                <div key={idx} className="py-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-8 h-8 bg-secondary text-primary font-bold rounded-full flex items-center justify-center text-xs">{item.quantity}x</span>
                                                        <p className="font-bold text-sm">{item.product.name}</p>
                                                    </div>
                                                    <p className="font-extrabold">₹{item.product.price * item.quantity}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-12">
                                        <button onClick={() => setStep(2)} className="flex-1 py-5 border-2 border-border text-foreground font-bold rounded-full">Back</button>
                                        <button onClick={handlePlaceOrder} className="flex-[2] py-5 bg-foreground text-white font-bold rounded-full shadow-2xl shadow-black/10 hover:bg-black transition-all">Command Acquisition</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/10 sticky top-28 space-y-6">
                                <h3 className="text-xl font-bold border-b border-border pb-4">Luxe Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-muted-foreground font-medium">
                                        <span>Subtotal</span>
                                        <span className="text-foreground">₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground font-medium">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? "text-primary font-bold" : "text-foreground"}>
                                            {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t border-dashed border-border flex justify-between items-end">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-3xl font-bold text-primary tracking-tighter">₹{total}</span>
                                    </div>
                                </div>

                                <div className="bg-secondary/50 p-4 rounded-2xl border border-primary/10">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <ShieldCheck size={18} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Guaranteed Integrity</span>
                                    </div>
                                    <p className="text-[10px] text-foreground/70 italic leading-relaxed">
                                        Your acquisition is protected by Shaikh Jee's signature satisfaction mandate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
};

export default CheckoutPage;
