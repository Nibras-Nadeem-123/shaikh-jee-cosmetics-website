"use client"
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { siteConfig, getShortAddress } from '@/config/siteConfig';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        inquiryType: 'General Assistance',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject || `${formData.inquiryType} Inquiry`,
                    message: formData.message,
                    inquiryType: formData.inquiryType
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    inquiryType: 'General Assistance',
                    subject: '',
                    message: ''
                });
            } else {
                setSubmitStatus('error');
                setErrorMessage(data.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            setSubmitStatus('error');
            setErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Header Banner */}
            <div className="bg-primary text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto px-4 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-2">
                        <Sparkles size={12} />
                        Get In Touch
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">How May We <span className="italic opacity-80">Assist You?</span></h1>
                    <p className="max-w-2xl mx-auto text-lg opacity-80 font-medium">Our beauty consultants are available to guide your signature routines.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Information Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {[
                            { icon: Mail, label: 'Email Us', value: siteConfig.contact.email, sub: 'Response within 24 hours' },
                            { icon: Phone, label: 'Call Us', value: siteConfig.contact.phone, sub: '9AM - 8PM Daily' },
                            { icon: MapPin, label: 'Visit Us', value: getShortAddress(), sub: '' },
                            { icon: Clock, label: 'Business Hours', value: siteConfig.hours.weekdays, sub: siteConfig.hours.weekend },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                        <p className="font-bold text-foreground">{item.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3rem] p-10 lg:p-16 border border-primary/5 shadow-xl shadow-primary/5 h-full">
                            <div className="mb-12">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Send Us a Message</h2>
                                <p className="text-muted-foreground">We would love to hear from you. Fill out the form below and we will get back to you.</p>
                            </div>

                            {submitStatus === 'success' ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle size={40} className="text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-4">Message Sent Successfully!</h3>
                                    <p className="text-muted-foreground mb-8">
                                        Thank you for reaching out. We have received your message and will get back to you within 24-48 hours.
                                    </p>
                                    <button
                                        onClick={() => setSubmitStatus('idle')}
                                        className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {submitStatus === 'error' && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Inquiry Type</label>
                                            <select
                                                name="inquiryType"
                                                value={formData.inquiryType}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium appearance-none"
                                            >
                                                <option value="General Assistance">General Assistance</option>
                                                <option value="Order Chronicles">Order Related</option>
                                                <option value="Beauty Advice">Beauty Advice</option>
                                                <option value="Returns & Refunds">Returns & Refunds</option>
                                                <option value="Technical Issue">Technical Issue</option>
                                                <option value="Wholesale Signature">Wholesale Inquiry</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Subject *</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium"
                                                placeholder="How can we help?"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Message *</label>
                                        <textarea
                                            name="message"
                                            rows={5}
                                            required
                                            minLength={10}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-muted/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary transition-all font-medium resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
