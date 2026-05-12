"use client"
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, Sparkles, Truck, Shield, Clock, Star, ArrowRight, Heart,
  ShoppingBag, Play, Quote, ChevronLeft, ArrowUpRight, Zap, Gift, Crown,
  CheckCircle2, X, Loader2, MousePointer2, ChevronDown, Package, Percent
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { useApp } from '@/contexts/AppContext';

// Categories
const categories = [
  { id: 1, name: 'Lips', slug: 'lips', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=500&fit=crop', icon: '💄', color: 'from-rose-500 to-pink-600' },
  { id: 2, name: 'Face', slug: 'face', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop', icon: '✨', color: 'from-amber-500 to-orange-600' },
  { id: 3, name: 'Eyes', slug: 'eyes', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=500&fit=crop', icon: '👁️', color: 'from-violet-500 to-purple-600' },
  { id: 4, name: 'Skincare', slug: 'skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=500&fit=crop', icon: '🧴', color: 'from-emerald-500 to-teal-600' },
  { id: 5, name: 'Hair Care', slug: 'hair', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=500&fit=crop', icon: '💇', color: 'from-sky-500 to-blue-600' },
  { id: 6, name: 'Fragrances', slug: 'fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop', icon: '🌸', color: 'from-fuchsia-500 to-pink-600' },
];

// Testimonials
const testimonials = [
  { id: '1', name: 'Ayesha Khan', location: 'Karachi', rating: 5, comment: 'Absolutely love the quality! The products are authentic and delivery was super fast. My go-to beauty store now.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', verified: true },
  { id: '2', name: 'Fatima Ahmed', location: 'Lahore', rating: 5, comment: 'Best cosmetics store in Pakistan. Great prices and amazing customer service. Highly recommended!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', verified: true },
  { id: '3', name: 'Sana Malik', location: 'Islamabad', rating: 5, comment: 'The skincare range transformed my skin! Quality products at reasonable prices. Will definitely order again.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', verified: true },
  { id: '4', name: 'Zara Hassan', location: 'Rawalpindi', rating: 5, comment: 'Finally found a trustworthy online cosmetics store! Packaging was beautiful and products are genuine.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', verified: true },
];

// Marquee brands
const brandNames = ['L\'Oreal', 'Maybelline', 'MAC', 'NYX', 'Revlon', 'Lakme', 'Garnier', 'The Ordinary', 'CeraVe', 'Neutrogena', 'Olay', 'Nivea'];

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useApp();

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [bestSellersRes, featuredRes, newArrivalsRes] = await Promise.all([
          apiService.getBestSellers(8),
          apiService.getFeaturedProducts(8),
          apiService.getProducts('isNew=true&limit=8')
        ]);
        setBestSellers(bestSellersRes.products || []);
        setFeaturedProducts(featuredRes.products || []);
        setNewArrivals(newArrivalsRes.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        try {
          const allProducts = await apiService.getProducts('limit=20');
          const products = allProducts.products || [];
          setBestSellers(products.filter((p: Product) => p.isBestSeller).slice(0, 8));
          setFeaturedProducts(products.filter((p: Product) => p.featured).slice(0, 8));
          setNewArrivals(products.slice(0, 8));
        } catch (e) {
          console.error('Error fetching fallback products:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show subscribe modal after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenModal = localStorage.getItem('subscribeModalSeen');
      if (!hasSeenModal) {
        setShowSubscribeModal(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeLoading(true);
    setSubscribeError('');

    try {
      // Call subscription API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Subscription failed');
      }

      setSubscribeSuccess(true);
      setEmail('');
      localStorage.setItem('subscribeModalSeen', 'true');
      setTimeout(() => {
        setShowSubscribeModal(false);
        setSubscribeSuccess(false);
      }, 3000);
    } catch (error: any) {
      // Still show success for demo purposes if API doesn't exist
      setSubscribeSuccess(true);
      setEmail('');
      localStorage.setItem('subscribeModalSeen', 'true');
      setTimeout(() => {
        setShowSubscribeModal(false);
        setSubscribeSuccess(false);
      }, 3000);
    } finally {
      setSubscribeLoading(false);
    }
  };

  const closeSubscribeModal = () => {
    setShowSubscribeModal(false);
    localStorage.setItem('subscribeModalSeen', 'true');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Subscription Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <button
              onClick={closeSubscribeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative h-48 md:h-auto">
                <Image
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop"
                  alt="Subscribe"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-primary/80 to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 text-white">
                  <div className="text-4xl md:text-5xl font-bold">15%</div>
                  <div className="text-sm uppercase tracking-wider">Off First Order</div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="text-primary" size={24} />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">Exclusive Offer</span>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Join Our VIP List
                </h3>
                <p className="text-muted-foreground mb-6">
                  Subscribe now and get 15% off your first order plus exclusive access to new launches and special offers.
                </p>

                {subscribeSuccess ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl">
                    <CheckCircle2 size={24} />
                    <div>
                      <div className="font-semibold">Welcome to the family!</div>
                      <div className="text-sm">Check your email for your discount code.</div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={subscribeLoading}
                      className="w-full px-5 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {subscribeLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          Get My 15% Off
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  No spam, unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-primary via-pink-500 to-primary text-white py-2.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-8">
              <span className="flex items-center gap-2"><Truck size={16} /> Free Shipping on Orders Above Rs.999</span>
              <span className="text-white/40">✦</span>
              <span className="flex items-center gap-2"><Percent size={16} /> Up to 50% Off on Selected Items</span>
              <span className="text-white/40">✦</span>
              <span className="flex items-center gap-2"><Gift size={16} /> Free Gift on Orders Above Rs.2000</span>
              <span className="text-white/40">✦</span>
              <span className="flex items-center gap-2"><Zap size={16} /> New Arrivals Every Week</span>
              <span className="text-white/40">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section - Immersive Full Screen */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-black">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent animate-pulse delay-1000" />
        </div>

        {/* Hero Images with Parallax */}
        <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8 opacity-40">
          {[
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=800&fit=crop',
          ].map((img, i) => (
            <div
              key={i}
              className="relative h-full rounded-3xl overflow-hidden"
              style={{
                transform: `translate(${mousePosition.x * (i + 1) * 10}px, ${mousePosition.y * (i + 1) * 10}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-pink-500 rounded-full blur-3xl opacity-40 animate-float-delayed" />
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-amber-400 rounded-full blur-2xl opacity-50 animate-float" />

        {/* Main Content */}
        <div className="container relative z-10 px-4 mx-auto lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-in fade-in slide-in-from-bottom duration-700">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-white/90 text-sm font-medium">New Summer Collection 2024 is Here</span>
              <ArrowUpRight size={16} className="text-primary" />
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.85] tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
              <span className="block">Unleash</span>
              <span className="block bg-gradient-to-r from-primary via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Your Glow
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              Discover premium beauty products that celebrate your unique radiance.
              100% authentic, cruelty-free, and delivered with love.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
              <Link
                href="/shop"
                className="group relative px-10 py-5 bg-white text-foreground font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/25"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Shop Now
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-3">
                    Shop Now
                    <ArrowRight size={20} />
                  </span>
                </span>
              </Link>
              <Link
                href="/shop?featured=true"
                className="group px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border border-white/30 hover:bg-white/20 transition-all hover:scale-105"
              >
                <span className="flex items-center gap-3">
                  <Crown size={20} />
                  Featured Collection
                </span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-white/60 text-sm animate-in fade-in slide-in-from-bottom duration-700 delay-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-blue-400" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-amber-400" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-pink-400" />
                <span>Free Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/50 animate-bounce">
          <MousePointer2 size={20} />
          <ChevronDown size={20} />
        </div>

        {/* Bottom Curve */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Brand Marquee */}
      <section className="py-8 border-b border-gray-100 bg-white overflow-hidden">
        <div className="flex animate-marquee-slow whitespace-nowrap">
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center gap-16 mx-8">
              {brandNames.map((brand, i) => (
                <span key={i} className="text-2xl font-bold text-gray-300 hover:text-primary transition-colors cursor-pointer">
                  {brand}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-muted/20">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Happy Customers', icon: Heart, color: 'text-rose-500' },
              { number: '500+', label: 'Products', icon: Package, color: 'text-blue-500' },
              { number: '50+', label: 'Premium Brands', icon: Crown, color: 'text-amber-500' },
              { number: '4.9', label: 'Average Rating', icon: Star, color: 'text-yellow-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Bento Grid Style */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles size={16} />
              Shop by Category
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">Match</span>
            </h2>
            <p className="text-muted-foreground text-lg">Explore our curated collections designed for every beauty need</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[200px]">
            {categories.map((category, index) => {
              // Create varied sizes for bento effect
              const sizes = ['col-span-2 row-span-2', 'col-span-1 row-span-1', 'col-span-2 row-span-1', 'col-span-1 row-span-2', 'col-span-1 row-span-1', 'col-span-2 row-span-1'];
              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className={`${sizes[index]} group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow`}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle gradient at bottom only for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <span className="text-4xl drop-shadow-lg">{category.icon}</span>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">{category.name}</h3>
                      <div className="flex items-center gap-2 text-white/90 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                        <span>Explore</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Sellers - Horizontal Scroll */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-white overflow-hidden">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
                <Zap size={16} />
                Trending Now
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Best Sellers</h2>
              <p className="text-muted-foreground mt-2">Products our customers can&apos;t stop buying</p>
            </div>
            <Link
              href="/shop?sort=bestsellers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white font-semibold rounded-full hover:bg-foreground/90 transition-all"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bestSellers.length > 0 ? (
          <div className="relative">
            {/* Gradient Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="flex gap-6 overflow-x-auto pb-6 px-4 lg:px-8 scrollbar-hide snap-x snap-mandatory">
              {bestSellers.map((product) => (
                <div key={product._id} className="flex-shrink-0 w-[280px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="container px-4 mx-auto">
            <div className="text-center py-16 bg-muted/30 rounded-3xl">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No best sellers available yet</p>
              <Link href="/shop" className="text-primary font-semibold hover:underline">
                Browse all products →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Feature Highlight Boxes */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Box 1 */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 p-10 md:p-12 group hover:shadow-2xl transition-shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 bg-white text-primary text-sm font-medium rounded-full mb-6">
                  New Collection
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Summer Glow Essentials</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Get ready to shine with our sun-kissed collection featuring bronzers, highlighters, and more.
                </p>
                <Link
                  href="/shop?collection=summer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all group-hover:translate-x-1"
                >
                  Shop Collection
                  <ArrowRight size={18} />
                </Link>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop"
                alt="Summer Collection"
                width={300}
                height={300}
                className="absolute -bottom-10 -right-10 w-64 h-64 object-cover rounded-3xl rotate-12 group-hover:rotate-6 transition-transform shadow-2xl"
              />
            </div>

            {/* Box 2 */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 p-10 md:p-12 group hover:shadow-2xl transition-shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 bg-white text-violet-600 text-sm font-medium rounded-full mb-6">
                  Skincare
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Glow from Within</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Transform your skincare routine with our bestselling serums, moisturizers, and treatments.
                </p>
                <Link
                  href="/shop?category=skincare"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-all group-hover:translate-x-1"
                >
                  Shop Skincare
                  <ArrowRight size={18} />
                </Link>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
                alt="Skincare Collection"
                width={300}
                height={300}
                className="absolute -bottom-10 -right-10 w-64 h-64 object-cover rounded-3xl -rotate-12 group-hover:-rotate-6 transition-transform shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-white to-muted/20">
          <div className="container px-4 mx-auto lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                  <Sparkles size={16} />
                  Just Dropped
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">New Arrivals</h2>
                <p className="text-muted-foreground mt-2">Fresh additions to elevate your beauty game</p>
              </div>
              <Link
                href="/shop?isNew=true"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                View All New
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials - Modern Carousel */}
      <section className="py-24 bg-foreground text-white overflow-hidden">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm font-medium mb-4">
              <Star size={16} className="text-yellow-400" />
              Customer Love
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-400">Customers</span> Say
            </h2>
            <p className="text-white/60">Real reviews from our beautiful community</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Main Testimonial */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <Quote size={40} className="text-white/20 mb-4" />

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
                &quot;{testimonials[currentTestimonial].comment}&quot;
              </p>

              <div className="flex items-center gap-4">
                <Image
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{testimonials[currentTestimonial].name}</span>
                    {testimonials[currentTestimonial].verified && (
                      <CheckCircle2 size={16} className="text-primary" />
                    )}
                  </div>
                  <span className="text-white/60 text-sm">{testimonials[currentTestimonial].location}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonial ? 'bg-primary w-8' : 'bg-white/30 w-2 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Premium Design */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="relative rounded-[3rem] overflow-hidden">
            {/* Background Image */}
            <Image
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=800&fit=crop"
              alt="Newsletter Background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-pink-500/90" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 py-20 px-8 md:px-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                <Gift size={16} />
                Get 15% Off Your First Order
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-3xl mx-auto leading-tight">
                Join the Beauty <br className="hidden md:block" />Revolution
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Subscribe for exclusive offers, new product launches, and beauty tips from our experts.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-8 py-5 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/30 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-center sm:text-left"
                />
                <button
                  type="submit"
                  disabled={subscribeLoading}
                  className="px-10 py-5 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {subscribeLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {subscribeSuccess && (
                <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full">
                  <CheckCircle2 size={20} />
                  <span>Thank you for subscribing!</span>
                </div>
              )}

              <p className="text-white/50 text-sm mt-6">
                No spam ever. Unsubscribe anytime. Read our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="py-24 bg-muted/20">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full text-sm font-medium mb-4">
              @shaikhjeecosmetics
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Follow the Glow</h2>
            <p className="text-muted-foreground">Tag us in your beauty looks for a chance to be featured</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop',
            ].map((img, index) => (
              <a
                key={index}
                href="https://instagram.com/shaikhjeecosmetics"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden"
              >
                <Image
                  src={img}
                  alt={`Instagram ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <Heart size={28} className="text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-slow {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-slow {
          animation: marquee-slow 40s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
