"use client"
import React from 'react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsletterSignup } from './NewsletterSignup';
import { siteConfig, getShortAddress } from '@/config/siteConfig';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { contact, social } = siteConfig;

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
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Instagram size={20} />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Facebook size={20} />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Twitter size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Shop All', href: '/shop' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-6">Customer Service</h4>
            <ul className="space-y-4">
              {[
                { name: 'Track Order', href: '/track' },
                { name: 'Shipping Info', href: '/shipping' },
                { name: 'Return Policy', href: '/return-policy' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms & Conditions', href: '/terms-conditions' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all"></span>
                    {link.name}
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
                <span>{contact.phone}</span>
              </li>
              <li className="flex items-start gap-4 text-foreground/80">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Mail size={18} />
                </div>
                <span>{contact.email}</span>
              </li>
              <li className="flex items-start gap-4 text-foreground/80">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <MapPin size={18} />
                </div>
                <span>{getShortAddress()}</span>
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

