"use client"
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Sparkles, Heart, Shield, Truck, Award, Users, Target, Eye, ChevronRight, Star, CheckCircle2, ArrowRight, Leaf, Gem } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: '10K+', label: 'Happy Customers', icon: Users },
    { number: '500+', label: 'Products', icon: Gem },
    { number: '50+', label: 'Premium Brands', icon: Award },
    { number: '4.9', label: 'Average Rating', icon: Star },
  ];

  const values = [
    { icon: Shield, title: '100% Authentic', description: 'Every product is sourced directly from authorized distributors and brands.' },
    { icon: Heart, title: 'Customer First', description: 'Your satisfaction is our top priority. We go above and beyond for you.' },
    { icon: Leaf, title: 'Cruelty Free', description: 'We support ethical beauty with cruelty-free and sustainable products.' },
    { icon: Truck, title: 'Fast Delivery', description: 'Quick and reliable shipping across Pakistan with order tracking.' },
  ];

  const team = [
    { name: 'Sarah Ahmed', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop' },
    { name: 'Fatima Khan', role: 'Beauty Director', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop' },
    { name: 'Ayesha Malik', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop' },
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
              <Sparkles className="w-4 h-4" />
              Our Story
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Beauty That
              <span className="block">Celebrates You</span>
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              At Shaikh Jee, we believe everyone deserves access to premium, authentic beauty products.
              We're on a mission to make luxury beauty accessible to all.
            </p>

            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">About Us</span>
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-7 h-7 text-pink-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-gradient-to-b from-white to-pink-50/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop"
                      alt="Beauty products"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop"
                      alt="Makeup"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="pt-8 space-y-4">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop"
                      alt="Lipstick"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=500&fit=crop"
                      alt="Skincare"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">5+ Years</div>
                    <div className="text-gray-500 text-sm">of Excellence</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
                  <Target className="w-4 h-4" />
                  Our Mission
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                  Making Premium Beauty
                  <span className="block bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Accessible to All
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  At Shaikh Jee, we believe that beauty should be accessible, safe, and luxurious for everyone.
                  Our mission is to deliver high-quality cosmetic products that enhance your natural beauty
                  without compromising on safety or affordability.
                </p>
              </div>

              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
                  <Eye className="w-4 h-4" />
                  Our Vision
                </span>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Founded with a passion for beauty and wellness, Shaikh Jee has grown into a trusted name
                  in the cosmetics industry. We carefully curate our product range to ensure every item
                  meets our strict quality standards and delivers exceptional results.
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full hover:shadow-xl hover:shadow-pink-500/25 transition-all hover:-translate-y-0.5"
              >
                Explore Our Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              Why Choose Us
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Values That
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"> Define Us</span>
            </h2>
            <p className="text-gray-600 text-lg">
              We're committed to bringing you the best beauty experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 hover:shadow-xl hover:shadow-pink-500/10 transition-all border border-pink-100 hover:border-pink-200"
              >
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" />
                The Shaikh Jee Promise
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                What Sets Us
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  Apart
                </span>
              </h2>
              <p className="text-white/70 text-lg mb-10">
                When you shop with Shaikh Jee, you're not just buying products – you're joining a community
                that celebrates authentic beauty.
              </p>

              <div className="space-y-4">
                {[
                  '100% Authentic products from trusted brands',
                  'Safe, dermatologically tested formulations',
                  'Affordable pricing without compromising quality',
                  'Free shipping on orders above Rs.1500',
                  'Easy returns and dedicated customer support',
                  'Cruelty-free and sustainable practices',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1523634118614-82b2685ee3df?w=600&h=600&fit=crop"
                  alt="Luxury cosmetics"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl opacity-50 blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-50 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              Our Team
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Meet the
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"> Experts</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Passionate beauty enthusiasts dedicated to bringing you the best
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="group text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-pink-500 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Enhance Your Beauty?
            </h2>
            <p className="text-white/80 text-lg mb-10">
              Join thousands of happy customers who trust Shaikh Jee for their beauty needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="px-10 py-5 bg-white text-gray-800 font-bold rounded-full hover:shadow-xl transition-all hover:scale-105"
              >
                Start Shopping
              </Link>
              <Link
                href="/contact"
                className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border border-white/30 hover:bg-white/20 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
