"use client";

import React, { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function NewsletterSignup({ variant = 'footer' }: { variant?: 'footer' | 'popup' | 'inline' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: variant })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      if (data.alreadySubscribed) {
        showToast('You are already subscribed!', 'success');
      } else {
        showToast('Successfully subscribed! Check your email for exclusive offers.', 'success');
        setSubscribed(true);
      }
      
      setEmail('');
    } catch (error) {
      showToast((error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={`p-6 bg-green-50 rounded-xl border border-green-200 ${variant === 'popup' ? 'text-center' : ''}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900">You&apos;re In!</h4>
            <p className="text-sm text-green-700">Thank you for subscribing to our newsletter.</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'popup') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full relative">
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('close-newsletter-popup'))}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Get 15% Off Your First Order!
            </h3>
            <p className="text-muted-foreground">
              Subscribe to our newsletter and receive exclusive offers, early access to new products, and beauty tips straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Subscribing...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Subscribe & Save 15%</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Footer variant
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <span>Subscribing...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Subscribe</span>
            </>
          )}
        </button>
      </form>
      <p className="mt-3 text-xs text-center text-muted-foreground">
        🎉 Get 15% off your first order + exclusive offers
      </p>
    </div>
  );
}
