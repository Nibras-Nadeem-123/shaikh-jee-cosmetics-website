"use client"

import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, Search, Sparkles, ArrowRight } from 'lucide-react';

const Custom404 = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

            {/* Floating Sparkles */}
            <div className="absolute top-20 left-[20%] animate-bounce">
                <Sparkles className="w-6 h-6 text-pink-300" />
            </div>
            <div className="absolute top-40 right-[25%] animate-bounce delay-100">
                <Sparkles className="w-4 h-4 text-purple-300" />
            </div>
            <div className="absolute bottom-32 left-[30%] animate-bounce delay-200">
                <Sparkles className="w-5 h-5 text-pink-400" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
                <div className="text-center max-w-2xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg shadow-pink-500/10 text-primary mb-8 border border-pink-100">
                        <Search size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">Page Not Found</span>
                    </div>

                    {/* 404 Number with Gradient */}
                    <div className="relative mb-8">
                        <h1 className="text-[180px] md:text-[220px] font-black leading-none tracking-tighter bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                            404
                        </h1>
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-600/20 blur-3xl -z-10" />
                    </div>

                    {/* Message */}
                    <div className="space-y-4 mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                            Oops! This page wandered off
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-md mx-auto">
                            The beauty page you're looking for seems to have vanished. Let's get you back to discovering amazing products.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/"
                            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-300"
                        >
                            <Home size={20} />
                            <span>Back to Home</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/shop"
                            className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-pink-200 text-foreground font-bold rounded-full shadow-lg hover:border-pink-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <ShoppingBag size={20} className="text-pink-500" />
                            <span>Browse Shop</span>
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl shadow-pink-500/5">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">
                            Popular Destinations
                        </h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                { label: 'New Arrivals', href: '/shop?filter=new' },
                                { label: 'Best Sellers', href: '/shop?filter=bestseller' },
                                { label: 'Skincare', href: '/shop?category=skincare' },
                                { label: 'Makeup', href: '/shop?category=makeup' },
                                { label: 'Contact Us', href: '/contact' },
                                { label: 'FAQ', href: '/faq' },
                            ].map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="px-5 py-2.5 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 text-foreground text-sm font-medium rounded-full border border-pink-100 hover:border-pink-200 transition-all hover:scale-105"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="url(#gradient)" fillOpacity="0.1"/>
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="0">
                            <stop stopColor="#ec4899" />
                            <stop offset="0.5" stopColor="#a855f7" />
                            <stop offset="1" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};

export default Custom404;
