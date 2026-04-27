"use client"
import React, { useState } from 'react';
import { Bell, BellOff, Loader2, Check, Mail } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface BackInStockAlertProps {
  productId: string;
  productName: string;
}

export const BackInStockAlert: React.FC<BackInStockAlertProps> = ({
  productId,
  productName,
}) => {
  const { user } = useApp();
  const [email, setEmail] = useState(user?.email || '');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/stock-alerts/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          productId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setMessage({ type: 'success', text: data.message || 'You will be notified when this product is back in stock!' });
        setShowForm(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to subscribe' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="p-4 border rounded-xl bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">You're on the list!</p>
            <p className="text-sm text-green-600">We'll email you when {productName} is back in stock.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-xl bg-amber-50 border-amber-200">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 shrink-0">
          <BellOff className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-800">Out of Stock</p>
          <p className="mb-3 text-sm text-amber-600">
            This item is currently unavailable. Get notified when it's back!
          </p>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-full bg-primary hover:bg-primary/90"
            >
              <Bell size={16} />
              <span>Notify Me</span>
            </button>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full py-2 pl-10 pr-4 text-sm border rounded-full border-amber-300 focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Bell size={16} />
                  )}
                  <span className="hidden sm:inline">{loading ? 'Subscribing...' : 'Notify Me'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-amber-600 hover:underline"
              >
                Cancel
              </button>
            </form>
          )}

          {message && (
            <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackInStockAlert;
