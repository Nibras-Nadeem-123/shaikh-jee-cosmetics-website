"use client"
import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowRight, Sparkles, Heart, Shield, Truck, Clock, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig, getShortAddress } from '@/config/siteConfig';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { contact, social } = siteConfig;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscribed(true);
    setLoading(false);
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'New Arrivals', href: '/shop?filter=new' },
    { name: 'Best Sellers', href: '/shop?filter=bestseller' },
    { name: 'Sale', href: '/shop?filter=sale' },
  ];

  const categories = [
    { name: 'Skincare', href: '/shop?category=skincare' },
    { name: 'Makeup', href: '/shop?category=makeup' },
    { name: 'Hair Care', href: '/shop?category=haircare' },
    { name: 'Fragrances', href: '/shop?category=fragrances' },
  ];

  const support = [
    { name: 'Track Order', href: '/track' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/return-policy' },
    { name: 'FAQ', href: '/faq' },
  ];

  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms', href: '/terms-conditions' },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-rose-200/30 to-amber-200/30 rounded-full blur-3xl" />
      </div>

      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAyNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="container mx-auto px-4 lg:px-8 py-16 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Get 15% off your first order</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Join Our Beauty Circle
                </h3>
                <p className="text-white/80 text-lg">
                  Exclusive offers, beauty tips & early access to new products
                </p>
              </div>

              {/* Right Form */}
              <div className="flex-1 w-full max-w-md">
                {subscribed ? (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                    </div>
                    <p className="text-white font-semibold text-lg">Welcome to the family!</p>
                    <p className="text-white/80 text-sm mt-1">Check your inbox for your discount code</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="relative">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 px-6 py-4 rounded-full bg-white/95 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Subscribe
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-white/60 text-xs mt-3 text-center sm:text-left">
                      By subscribing, you agree to our Privacy Policy
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over Rs. 1500' },
              { icon: Shield, title: '100% Authentic', desc: 'Genuine products only' },
              { icon: Clock, title: 'Fast Delivery', desc: '2-5 business days' },
              { icon: Heart, title: 'Easy Returns', desc: '7-day return policy' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2 pr-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Shaikh Jee
                </span>
              </Link>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-sm">
                Your trusted destination for premium, authentic cosmetics that enhance your natural beauty. Quality you can trust, prices you'll love.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
                  >
                    <Facebook size={18} />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
                  >
                    <Twitter size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Shop</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-pink-500 transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-pink-500 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Categories</h4>
              <ul className="space-y-3">
                {categories.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-pink-500 transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-pink-500 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                {support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-pink-500 transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-pink-500 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-4">
                <li>
                  <a href={`tel:${contact.phone}`} className="flex items-start gap-3 text-gray-600 hover:text-pink-500 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                      <Phone size={14} className="text-pink-500" />
                    </div>
                    <span className="text-sm pt-1.5">{contact.phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contact.email}`} className="flex items-start gap-3 text-gray-600 hover:text-pink-500 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                      <Mail size={14} className="text-pink-500" />
                    </div>
                    <span className="text-sm pt-1.5 break-all">{contact.email}</span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-pink-500" />
                  </div>
                  <span className="text-sm pt-1.5">{getShortAddress()}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 text-white relative">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
              <p>
                © {currentYear} <span className="text-white font-semibold">Shaikh Jee</span>. All rights reserved.
              </p>
              <div className="hidden sm:block w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms-conditions" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden sm:inline">Secure Payments</span>
              <div className="flex items-center gap-3">
                <div className="h-7 px-2 bg-white rounded flex items-center justify-center">
                  <Image src="/visa.svg" alt="Visa" width={32} height={20} className="h-4 w-auto" />
                </div>
                <div className="h-7 px-2 bg-white rounded flex items-center justify-center">
                  <Image src="/mastercard.svg" alt="Mastercard" width={32} height={20} className="h-5 w-auto" />
                </div>
                <div className="h-7 px-3 bg-white rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-700 tracking-wider">UPI</span>
                </div>
                <div className="h-7 px-3 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white tracking-wider">COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all group"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </footer>
  );
};
