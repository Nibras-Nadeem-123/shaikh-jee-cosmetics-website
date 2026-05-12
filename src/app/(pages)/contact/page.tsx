"use client"
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Sparkles, Loader2, CheckCircle, MessageCircle, ChevronRight, Instagram, Facebook, Twitter, HeadphonesIcon, HelpCircle } from 'lucide-react';
import { siteConfig, getShortAddress, getFullAddress } from '@/config/siteConfig';
import Link from 'next/link';
import Image from 'next/image';

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

    const contactMethods = [
        {
            icon: Mail,
            label: 'Email Us',
            value: siteConfig.contact.email,
            sub: 'Response within 24 hours',
            action: `mailto:${siteConfig.contact.email}`,
            color: 'from-pink-500 to-rose-500'
        },
        {
            icon: Phone,
            label: 'Call Us',
            value: siteConfig.contact.phone,
            sub: '9AM - 8PM Daily',
            action: `tel:${siteConfig.contact.phone}`,
            color: 'from-purple-500 to-indigo-500'
        },
        {
            icon: MessageCircle,
            label: 'WhatsApp',
            value: 'Chat with us',
            sub: 'Quick responses',
            action: `https://wa.me/${siteConfig.contact.whatsapp?.replace(/[^0-9]/g, '')}`,
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: MapPin,
            label: 'Visit Us',
            value: getShortAddress(),
            sub: 'Walk-in welcome',
            action: '#map',
            color: 'from-amber-500 to-orange-500'
        },
    ];

    const faqs = [
        { q: 'What are your delivery times?', a: 'We deliver within 2-5 business days across Pakistan.' },
        { q: 'Do you offer returns?', a: 'Yes, we have a 7-day easy return policy for unused products.' },
        { q: 'Are all products authentic?', a: 'Yes, 100% authentic products sourced from authorized distributors.' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAyNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
                </div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />

                <div className="container relative z-10 mx-auto px-4 lg:px-8 py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                            <HeadphonesIcon className="w-4 h-4" />
                            We're Here to Help
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            Get In Touch
                            <span className="block text-white/80">With Us</span>
                        </h1>

                        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                            Have questions about our products or need beauty advice?
                            Our team is ready to assist you with personalized support.
                        </p>

                        {/* Breadcrumb */}
                        <nav className="flex items-center justify-center gap-2 text-sm text-white/60">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white">Contact Us</span>
                        </nav>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                    </svg>
                </div>
            </section>

            {/* Contact Methods Cards */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-32 relative z-20">
                        {contactMethods.map((method, i) => (
                            <a
                                key={i}
                                href={method.action}
                                className="group bg-white rounded-3xl p-8 shadow-xl shadow-pink-500/5 border border-pink-100 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-500/10 transition-all hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                                    <method.icon className="w-7 h-7 text-white" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{method.label}</p>
                                <p className="text-lg font-bold text-gray-800 mb-1">{method.value}</p>
                                <p className="text-sm text-gray-500">{method.sub}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 bg-gradient-to-b from-white to-pink-50/30">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div>
                            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-pink-500/5 border border-pink-100">
                                <div className="mb-10">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
                                        <Send className="w-4 h-4" />
                                        Send a Message
                                    </span>
                                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
                                        We'd Love to Hear
                                        <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"> From You</span>
                                    </h2>
                                    <p className="text-gray-600">Fill out the form and we'll get back to you within 24 hours.</p>
                                </div>

                                {submitStatus === 'success' ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Message Sent!</h3>
                                        <p className="text-gray-600 mb-8">
                                            Thank you for reaching out. We'll respond within 24-48 hours.
                                        </p>
                                        <button
                                            onClick={() => setSubmitStatus('idle')}
                                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                                        >
                                            Send Another Message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {submitStatus === 'error' && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                                                {errorMessage}
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium"
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inquiry Type</label>
                                                <select
                                                    name="inquiryType"
                                                    value={formData.inquiryType}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    <option value="General Assistance">General Assistance</option>
                                                    <option value="Order Related">Order Related</option>
                                                    <option value="Beauty Advice">Beauty Advice</option>
                                                    <option value="Returns & Refunds">Returns & Refunds</option>
                                                    <option value="Technical Issue">Technical Issue</option>
                                                    <option value="Wholesale Inquiry">Wholesale Inquiry</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject *</label>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    required
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium"
                                                    placeholder="How can we help?"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Message *</label>
                                            <textarea
                                                name="message"
                                                rows={5}
                                                required
                                                minLength={10}
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium resize-none"
                                                placeholder="Tell us more about your inquiry..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-pink-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send Message
                                                    <Send className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Business Hours */}
                            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold">Business Hours</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-3 border-b border-white/20">
                                            <span className="text-white/80">Monday - Friday</span>
                                            <span className="font-semibold">{siteConfig.hours.weekdays}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/20">
                                            <span className="text-white/80">Saturday - Sunday</span>
                                            <span className="font-semibold">{siteConfig.hours.weekend}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-white/80">Response Time</span>
                                            <span className="font-semibold">Within 24 hours</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-pink-500/5 border border-pink-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                                        <HelpCircle className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Quick Answers</h3>
                                </div>
                                <div className="space-y-4">
                                    {faqs.map((faq, i) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors">
                                            <p className="font-semibold text-gray-800 mb-1">{faq.q}</p>
                                            <p className="text-gray-600 text-sm">{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href="/faq"
                                    className="inline-flex items-center gap-2 mt-6 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
                                >
                                    View All FAQs
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Social Links */}
                            <div className="bg-gray-900 rounded-3xl p-8 text-white">
                                <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                                <p className="text-white/70 mb-6">Follow us on social media for updates, tips, and exclusive offers.</p>
                                <div className="flex gap-4">
                                    {siteConfig.social.instagram && (
                                        <a
                                            href={siteConfig.social.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {siteConfig.social.facebook && (
                                        <a
                                            href={siteConfig.social.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                    )}
                                    {siteConfig.social.twitter && (
                                        <a
                                            href={siteConfig.social.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section id="map" className="py-24 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
                            <MapPin className="w-4 h-4" />
                            Our Location
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                            Visit Our
                            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"> Store</span>
                        </h2>
                        <p className="text-gray-600">{getFullAddress()}</p>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden shadow-xl h-[400px] bg-gradient-to-br from-pink-100 to-purple-100">
                        {/* Placeholder for map - you can integrate Google Maps here */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center animate-pulse">
                                    <MapPin className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-gray-600 font-medium">{getShortAddress()}</p>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                                >
                                    Open in Google Maps
                                    <ChevronRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
