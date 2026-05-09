"use client"
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, CreditCard, ShieldCheck, Truck, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AuthGuard } from '@/components/RoleGuard';
import { paymentService } from '@/services/payment';

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
}

const CheckoutPage = () => {
    const { cart, cartTotal, createOrder, user, token } = useApp();
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

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

    // Load payment methods on mount
    useEffect(() => {
        const loadPaymentMethods = async () => {
            const methods = await paymentService.getPaymentMethods();
            setPaymentMethods(methods);
        };
        loadPaymentMethods();
    }, []);

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
            }));
        }
    }, [user]);

    const handlePlaceOrder = async () => {
        if (!formData.state) {
            alert('Please select a state before placing the order.');
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            // Transform cart items to order items with required fields
            const orderItems = cart.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                image: item.product.images?.[0] || '',
                price: item.product.price,
                selectedShade: item.selectedShade ? {
                    id: item.selectedShade._id,
                    name: item.selectedShade.name,
                    color: item.selectedShade.color
                } : undefined
            }));

            const orderData = {
                orderItems,
                itemsPrice: cartTotal,
                shippingPrice: shipping,
                totalPrice: total,
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
                paymentMethod: selectedPaymentMethod === 'razorpay' ? 'Online' : 'COD'
            };

            // Create the order first
            const order = await createOrder(orderData);

            if (selectedPaymentMethod === 'razorpay' && order?._id) {
                // Process Razorpay payment
                await processRazorpayPayment(order._id, total);
            } else {
                // COD - redirect to success page
                router.push('/OrderSuccess');
            }
        } catch (error: any) {
            console.error('Error placing order:', error);
            setPaymentError(error.message || 'An error occurred while placing the order. Please try again.');
            setIsProcessing(false);
        }
    };

    const processRazorpayPayment = async (orderId: string, amount: number) => {
        try {
            // Create Razorpay order
            const razorpayOrder = await paymentService.createRazorpayOrder(amount, orderId, token!);

            if (!razorpayOrder) {
                throw new Error('Failed to create payment order');
            }

            // Open Razorpay checkout
            await paymentService.openRazorpayCheckout(
                razorpayOrder.razorpayOrderId,
                razorpayOrder.amount,
                razorpayOrder.keyId,
                orderId,
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                },
                token!,
                () => {
                    // Payment successful
                    router.push('/OrderSuccess');
                },
                (error: { message?: string }) => {
                    // Payment failed or cancelled
                    setPaymentError(error.message || 'Payment failed. Please try again.');
                    setIsProcessing(false);
                }
            );
        } catch (error: any) {
            console.error('Razorpay payment error:', error);
            setPaymentError(error.message || 'Payment processing failed. Please try again.');
            setIsProcessing(false);
        }
    };

    // Pakistani Provinces and Territories
    const provinces = [
        'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
        'Islamabad Capital Territory', 'Azad Jammu & Kashmir', 'Gilgit-Baltistan'
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
                                    <h2 className="text-3xl font-bold tracking-tight mb-8">Shipping Details</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Phone Number *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+92 3XX XXXXXXX"
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Province *</label>
                                            <select
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none appearance-none"
                                                required
                                            >
                                                <option value="">Select a province</option>
                                                {provinces.map((province) => (
                                                    <option key={province} value={province}>{province}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Street Address *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.addressLine1}
                                                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                                placeholder="House number and street name"
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Apartment, suite, etc. (optional)</label>
                                            <input
                                                type="text"
                                                value={formData.addressLine2}
                                                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                                placeholder="Apartment, suite, unit, building, floor, etc."
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">City *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">PIN Code *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.pincode}
                                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                maxLength={6}
                                                className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-medium outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!formData.name || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
                                                alert('Please fill in all required fields');
                                                return;
                                            }
                                            setStep(2);
                                        }}
                                        className="mt-10 w-full py-5 bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group hover:bg-primary/90 transition-all"
                                    >
                                        Proceed to Payment
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-primary/5 border border-primary/5 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-bold tracking-tight mb-8">Payment Method</h2>
                                    <div className="space-y-4">
                                        {paymentMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                onClick={() => method.enabled && setSelectedPaymentMethod(method.id)}
                                                className={`p-6 border-2 rounded-[2rem] flex items-center justify-between transition-all ${
                                                    selectedPaymentMethod === method.id
                                                        ? 'border-primary bg-primary/5'
                                                        : method.enabled
                                                        ? 'border-border hover:border-primary/50 cursor-pointer'
                                                        : 'border-border opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                                        selectedPaymentMethod === method.id
                                                            ? 'bg-primary text-white'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {method.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{method.name}</p>
                                                        <p className="text-xs text-muted-foreground">{method.description}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 border-4 rounded-full ${
                                                    selectedPaymentMethod === method.id
                                                        ? 'border-primary bg-white'
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {selectedPaymentMethod === method.id && (
                                                        <div className="w-full h-full rounded-full bg-primary scale-50" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedPaymentMethod === 'razorpay' && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="text-sm text-blue-800">
                                                <strong>Secure Payment:</strong> You will be redirected to Razorpay's secure payment gateway to complete your payment using Cards, UPI, Net Banking, or Wallets.
                                            </p>
                                        </div>
                                    )}

                                    {selectedPaymentMethod === 'cod' && (
                                        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <p className="text-sm text-amber-800">
                                                <strong>Cash on Delivery:</strong> Please keep the exact amount ready at the time of delivery. Our delivery partner will collect the payment.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-10">
                                        <button onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-border text-foreground font-bold rounded-full hover:bg-secondary transition-all">Back</button>
                                        <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">Review Order</button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-primary/5 border border-primary/5 animate-in fade-in zoom-in duration-500">
                                    <h2 className="text-3xl font-bold tracking-tight mb-8">Review Your Order</h2>

                                    {paymentError && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                            <p className="text-red-800">{paymentError}</p>
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        <div className="p-6 bg-muted/30 rounded-[2rem] border border-border">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Shipping Address</h3>
                                            <p className="font-bold text-foreground">{formData.name}</p>
                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                {formData.addressLine1}
                                                {formData.addressLine2 && `, ${formData.addressLine2}`}
                                                <br />
                                                {formData.city}, {formData.state} - {formData.pincode}
                                                <br />
                                                Phone: {formData.phone}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-muted/30 rounded-[2rem] border border-border">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Payment Method</h3>
                                            <p className="font-bold text-foreground">
                                                {selectedPaymentMethod === 'razorpay' ? 'Pay Online (Cards, UPI, Net Banking)' : 'Cash on Delivery'}
                                            </p>
                                        </div>

                                        <div className="divide-y divide-border">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Order Items</h3>
                                            {cart.map((item, idx) => (
                                                <div key={idx} className="py-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-8 h-8 bg-secondary text-primary font-bold rounded-full flex items-center justify-center text-xs">{item.quantity}x</span>
                                                        <div>
                                                            <p className="font-bold text-sm">{item.product.name}</p>
                                                            {item.selectedShade && (
                                                                <p className="text-xs text-muted-foreground">Shade: {item.selectedShade.name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="font-extrabold">Rs.{item.product.price * item.quantity}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-12">
                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={isProcessing}
                                            className="flex-1 py-5 border-2 border-border text-foreground font-bold rounded-full hover:bg-secondary transition-all disabled:opacity-50"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                            className="flex-[2] py-5 bg-foreground text-white font-bold rounded-full shadow-2xl shadow-black/10 hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                selectedPaymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-primary/10 sticky top-28 space-y-6">
                                <h3 className="text-xl font-bold border-b border-border pb-4">Order Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-muted-foreground font-medium">
                                        <span>Subtotal ({cart.length} items)</span>
                                        <span className="text-foreground">Rs.{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground font-medium">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? "text-green-600 font-bold" : "text-foreground"}>
                                            {shipping === 0 ? 'FREE' : `Rs.${shipping}`}
                                        </span>
                                    </div>
                                    {shipping > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Add Rs.{999 - cartTotal} more for free shipping
                                        </p>
                                    )}
                                    <div className="pt-4 border-t border-dashed border-border flex justify-between items-end">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-3xl font-bold text-primary tracking-tighter">Rs.{total}</span>
                                    </div>
                                </div>

                                <div className="bg-secondary/50 p-4 rounded-2xl border border-primary/10">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <ShieldCheck size={18} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
                                    </div>
                                    <p className="text-[10px] text-foreground/70 leading-relaxed">
                                        Your payment information is encrypted and secure. We never store your card details.
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
