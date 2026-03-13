"use client"
import React from 'react';
import { ChevronRight, Sparkles, TruckIcon, ShieldCheck, HeadphonesIcon, PlayCircle } from 'lucide-react';
import { products } from '@/data/products';
import { categories } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { reviews } from '@/data/products';

export default function HomePage() {
  const bestSellers = products.filter((p) => p.isBestSeller);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden ">
        <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-50 px-4 py-20 mx-auto lg:px-8 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-10 duration-700 animate-in fade-in slide-in-from-left">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-primary/20 rounded-full shadow-sm">
                <Sparkles size={18} className="text-primary" />
                <span className="text-sm font-bold tracking-wider uppercase text-primary">New Year Beauty Sale</span>
              </div>

              <div className="z-30 space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Enhance Your <br />
                  <span className="italic text-primary">Natural Beauty</span>
                </h1>
                <p className="max-w-xl text-xl leading-relaxed text-muted-foreground">
                  Premium cosmetics that are safe, affordable, and luxurious. Discover your perfect beauty essentials curated just for you.
                </p>
              </div>

              <div className="flex flex-wrap gap-5">
                {/* <Link
                  href="/shop"
                  className="flex items-center gap-3 px-10 py-5 font-bold text-white transition-all rounded-full shadow-xl bg-primary hover:bg-primary/90 shadow-primary/20 active:scale-95"
                >
                  Shop the Collection
                  <ChevronRight size={20} />
                </Link> */}
                <Link
                  href="/about"
                  className="flex items-center gap-3 px-10 py-5 font-bold transition-all border-2 rounded-full border-foreground text-foreground hover:bg-foreground hover:text-white active:scale-95"
                >
                  Our Story
                  <PlayCircle size={20} />
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                   <p className="text-2xl font-bold text-foreground">10k+</p>
                   <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Happy Clients</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                   <p className="text-2xl font-bold text-foreground">500+</p>
                   <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Premium Products</p>
                </div>
              </div>
            </div>

            <div className="relative duration-700 delay-200 animate-in fade-in slide-in-from-right">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1523634118614-82b2685ee3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjb3NtZXRpY3MlMjBtYWtldXB8ZW58MXx8fHwxNzY3MzU4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Beauty Products"
                  width={1080}
                  height={800}
                  className="object-cover w-full h-auto aspect-4/5"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute w-40 h-40 rounded-full -top-10 -right-10 bg-accent -z-10 blur-2xl" />
              <div className="absolute rounded-full -bottom-10 -left-10 w-60 h-60 bg-primary/20 -z-10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-b border-border">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TruckIcon, title: "Free Shipping", desc: "On orders above ₹999" },
              { icon: ShieldCheck, title: "100% Authentic", desc: "Genuine products from top brands" },
              { icon: HeadphonesIcon, title: "24/7 Support", desc: "Dedicated beauty consultants" },
              { icon: Sparkles, title: "Vegan & Safe", desc: "Dermatologically tested formulas" }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 text-center group">
                <div className="p-5 transition-all transform bg-secondary rounded-2xl text-primary group-hover:bg-primary group-hover:text-white group-hover:rotate-6">
                  <feature.icon size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="flex flex-col items-end justify-between gap-6 mb-16 md:flex-row">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Shop by Category</h2>
              <p className="text-lg italic text-muted-foreground">Curated essentials for every beauty routine</p>
            </div>
            {/* <Link href="/shop" className="flex items-center gap-2 font-bold transition-colors group text-primary hover:text-primary/80">
              Browse Everything
              <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link> */}
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              // <Link
              //   key={category.id}
              //   href={`/shop?category=${category.slug}`}
              //   className="relative h-48 overflow-hidden transition-all shadow-sm group rounded-3xl hover:shadow-xl"
              // >
              //   <Image
              //     src={
              //       category.image ||
              //       'https://via.placeholder.com/300x400?text=Category+Image'}
              //     alt={category.name}
              //     fill
              //     className="object-cover transition-transform duration-500 group-hover:scale-110"
              //   />
              //   <div className="absolute inset-0 flex flex-col justify-end p-5 bg-linear-to-t from-black/80 via-black/20 to-transparent">
              //      <h3 className="text-lg font-bold leading-tight text-white transition-colors group-hover:text-primary">{category.name}</h3>
              //      {/* <p className="mt-1 text-xs transition-all transform translate-y-4 opacity-0 text-white/60 group-hover:translate-y-0 group-hover:opacity-100">{category.description}</p> */}
              //   </div>
              // </Link>
              <div key={category.id} className="relative h-48 overflow-hidden transition-all shadow-sm group rounded-3xl hover:shadow-xl">
                <Image
                  src={
                    category.image ||
                    'https://via.placeholder.com/300x400?text=Category+Image'}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5 bg-linear-to-t from-black/80 via-black/20 to-transparent">
                   <h3 className="text-lg font-bold leading-tight text-white transition-colors group-hover:text-primary">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 overflow-hidden bg-white">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-foreground">Best Sellers</h2>
              <div className="w-20 h-1 rounded-full bg-primary" />
            </div>
            {/* <Link
              href="/shop?filter=bestsellers"
              className="px-8 py-3 text-sm font-bold tracking-wide transition-all border-2 rounded-full border-foreground hover:bg-foreground hover:text-white"
            >
              View All Favorites
            </Link> */}
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="container px-4 py-10 mx-auto lg:px-8">
        <div className="relative rounded-[3rem] overflow-hidden bg-primary px-8 py-20 lg:py-32 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold leading-tight tracking-tight lg:text-6xl">Your Beauty, <br /> Our Priority</h2>
            <p className="text-xl leading-relaxed text-white/90">
              Join thousands of happy customers who trust Shaikh Jee for their premium beauty needs. Experience the luxury of pure radiance today.
            </p>
            <div className="flex flex-col justify-center gap-5 pt-4 sm:flex-row">
              {/* <Link
                href="/shop"
                className="px-12 py-5 font-bold transition-all bg-white rounded-full shadow-xl text-primary hover:bg-secondary shadow-black/10 active:scale-95"
              >
                Start Shopping Now
              </Link> */}
              <Link
                 href="/contact"
                 className="px-12 py-5 font-bold text-white transition-all border-2 rounded-full border-white/40 hover:bg-white/10 backdrop-blur-sm active:scale-95"
              >
                 Contact Expert
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto lg:px-8">
          <div className="mb-20 space-y-4 text-center">
            <h2 className="text-4xl font-bold text-foreground">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">Real reviews from our beautiful community</p>
          </div>
          

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {reviews.map((review, index) => (
              <div key={review._id} className="p-10 bg-secondary/30 rounded-[2.5rem] border border-accent/50 hover:bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="flex gap-1.5">
                    {[...Array(review.rating)].map((_, i) => (
                        <Sparkles key={i} size={16} className="text-primary fill-primary" />
                    ))}
                    </div>
                    <p className="text-lg italic leading-relaxed text-foreground/90">&quot;{review.comment}&quot;</p>
                </div>
                <div className="flex items-center gap-4 mt-10">
                  <div className="flex items-center justify-center w-12 h-12 font-bold text-white transition-transform rounded-full shadow-lg bg-primary shadow-primary/20 group-hover:scale-110">
                     {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{review.userName}</div>
                    <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Customer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

