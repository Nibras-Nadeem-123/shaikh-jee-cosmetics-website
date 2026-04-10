"use client"
import React from 'react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsletterSignup } from './NewsletterSignup';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary mt-auto border-t border-border">
      {/* Newsletter Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Join Our Beauty Community</h3>
            <p className="text-muted-foreground mb-8 text-lg">Get exclusive offers, beauty tips, and new product updates exactly as you like.</p>
            <NewsletterSignup variant="footer" />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div className="space-y-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
                <h1 className="text-2xl font-bold text-primary tracking-tight">Shaikh Jee</h1>
            </Link>
            <p className="text-foreground/80 leading-relaxed">
              Your trusted destination for premium, safe, and affordable cosmetics that enhance natural beauty. Designed for your everyday luxury.
            </p>
            <div className="flex gap-5">
              <a href="#" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['About Us', 'Shop All', 'Contact Us', 'FAQ'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-6">Customer Service</h4>
            <ul className="space-y-4">
              {['Track Order', 'Return Policy', 'Privacy Policy', 'Terms & Conditions'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-6">Get In Touch</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-foreground/80">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Phone size={18} />
                </div>
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-start gap-4 text-foreground/80">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Mail size={18} />
                </div>
                <span>support@shaikhjee.com</span>
              </li>
              <li className="flex items-start gap-4 text-foreground/80">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <MapPin size={18} />
                </div>
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-foreground/60">
            <p>© {currentYear} <span className="font-bold text-primary">Shaikh Jee</span>. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Image src="/visa.svg" alt="Visa" height={32} width={48} className="h-4 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
              <Image src="/mastercard.svg" alt="Mastercard" height={32} width={48} className="h-6 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
              <div className="px-3 py-1 border border-border rounded text-[10px] font-bold tracking-widest uppercase">UPI</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

