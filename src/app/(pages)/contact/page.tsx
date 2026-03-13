"use client"
import React from 'react';
import { Mail, Phone, MapPin, Clock, Send, Sparkles } from 'lucide-react';

const ContactPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Your message has been received by our beauty consultants! We will reach out to you within 24 hours.');
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Header Banner */}
            <div className="bg-primary text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto px-4 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-2">
                        <Sparkles size={12} />
                        Shaikh Jee Concierge
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">How May We <span className="italic opacity-80">Assist You?</span></h1>
                    <p className="max-w-2xl mx-auto text-lg opacity-80 font-medium italic">Our beauty consultants are available to guide your signature routines.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Information Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {[
                            { icon: Mail, label: 'Email Registry', value: 'support@shaikhjee.com', sub: '24/7 Response time' },
                            { icon: Phone, label: 'Communication', value: '+91 9876543210', sub: '9AM - 8PM Daily' },
                            { icon: MapPin, label: 'The Boutique', value: '123 Beauty Street, Mumbai', sub: 'Maharashtra 400001' },
                            { icon: Clock, label: 'Visiting Hours', value: 'Mon - Sat: 9AM - 8PM', sub: 'Sunday: 10AM - 6PM' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                        <p className="font-bold text-foreground">{item.value}</p>
                                        <p className="text-xs text-muted-foreground italic mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3rem] p-10 lg:p-16 border border-primary/5 shadow-xl shadow-primary/5 h-full">
                            <div className="mb-12">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Direct Message</h2>
                                <p className="text-muted-foreground italic">Thy inquiries are our priority. Pray, send your thoughts.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium"
                                            placeholder="Identity"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email Connection</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium"
                                            placeholder="you@luxury.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Inquiry Nature</label>
                                    <select className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium appearance-none">
                                        <option>General Assistance</option>
                                        <option>Order Chronicles</option>
                                        <option>Beauty Advice</option>
                                        <option>Wholesale Signature</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Thy Message</label>
                                    <textarea
                                        rows={5}
                                        required
                                        className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium resize-none"
                                        placeholder="Speak thy heart..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group hover:bg-primary/90 transition-all active:scale-[0.98]"
                                >
                                    Transmit Message
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
