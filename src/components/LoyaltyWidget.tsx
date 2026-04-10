"use client";

import React, { useState, useEffect } from 'react';
import { Gift, Trophy, Star, TrendingUp, ShoppingBag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { loyaltyApi } from '@/services/loyalty';
import { useToast } from '@/hooks/useToast';

interface LoyaltyData {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimePoints: number;
  redeemedPoints: number;
  nextTierPoints: number;
  history: Array<{
    type: string;
    points: number;
    description: string;
    createdAt: string;
  }>;
}

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎'
};

const tierColors = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-500 to-yellow-700',
  platinum: 'from-cyan-400 to-blue-600'
};

export function LoyaltyWidget() {
  const { user } = useApp();
  const { showToast } = useToast();
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');

  useEffect(() => {
    if (user) {
      fetchLoyalty();
    }
  }, [user]);

  const fetchLoyalty = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const data = await loyaltyApi.getLoyaltyPoints(token);
      setLoyalty(data.loyalty);
    } catch (error) {
      console.error('Failed to fetch loyalty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(redeemAmount);
    
    if (isNaN(points) || points <= 0) {
      showToast('Please enter valid points', 'error');
      return;
    }

    if (!loyalty || points > loyalty.points) {
      showToast('Insufficient points', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await loyaltyApi.redeemPoints(points, token);
      showToast(`Successfully redeemed ${points} points for ₹${data.discount} off!`, 'success');
      setRedeemAmount('');
      setShowRedeemModal(false);
      fetchLoyalty();
    } catch (error) {
      showToast((error as Error).message, 'error');
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
        <div className="text-center">
          <Gift className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-bold text-foreground mb-2">Join Loyalty Program</h3>
          <p className="text-sm text-muted-foreground mb-4">Earn points on every purchase and get exclusive rewards</p>
          <p className="text-xs text-muted-foreground">Login to view your points</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-primary/20 rounded w-1/2"></div>
          <div className="h-12 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Points Card */}
      <div className={`p-6 bg-gradient-to-r ${tierColors[loyalty?.tier || 'bronze']} rounded-2xl text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">Available Points</p>
            <p className="text-4xl font-bold">{loyalty?.points || 0}</p>
          </div>
          <div className="text-6xl">{tierIcons[loyalty?.tier || 'bronze']}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{loyalty?.tier.toUpperCase()} MEMBER</p>
            <p className="text-xs opacity-90">{loyalty?.nextTierPoints || 0} pts to next tier</p>
          </div>
          <button
            onClick={() => setShowRedeemModal(true)}
            className="px-4 py-2 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-all text-sm"
          >
            Redeem
          </button>
        </div>

        {/* Progress Bar */}
        {loyalty?.nextTierPoints && loyalty.nextTierPoints > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress to next tier</span>
              <span>{Math.round(((loyalty.lifetimePoints % 500) / 500) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${((loyalty.lifetimePoints % 500) / 500) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-secondary/50 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Lifetime</span>
          </div>
          <p className="text-xl font-bold text-foreground">{loyalty?.lifetimePoints || 0}</p>
        </div>
        
        <div className="p-4 bg-secondary/50 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Redeemed</span>
          </div>
          <p className="text-xl font-bold text-foreground">{loyalty?.redeemedPoints || 0}</p>
        </div>
      </div>

      {/* Recent Activity */}
      {loyalty?.history && loyalty.history.length > 0 && (
        <div className="p-4 bg-secondary/30 rounded-xl border border-primary/10">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Recent Activity
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {loyalty.history.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.type === 'earned' ? (
                    <Star className="w-3 h-3 fill-green-500 text-green-500" />
                  ) : (
                    <ShoppingBag className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
                <span className={`font-medium ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">Redeem Points</h3>
            <p className="text-muted-foreground mb-4">
              Available: {loyalty?.points || 0} points (₹{loyalty?.points || 0})
            </p>
            
            <form onSubmit={handleRedeem}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Points to redeem
                </label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="Enter points"
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  min="1"
                  max={loyalty?.points}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 px-4 py-2 border border-primary/20 text-foreground rounded-lg hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                >
                  Redeem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
