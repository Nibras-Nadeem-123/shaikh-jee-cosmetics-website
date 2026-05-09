"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Share2, Gift, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalBonusEarned: number;
}

interface ReferralRewards {
  referrerBonus: { type: string; value: number };
  refereeBonus: { type: string; value: number };
}

interface ReferralHistory {
  id: string;
  referee: { name: string; joinedAt: string } | null;
  status: 'pending' | 'registered' | 'purchased' | 'rewarded';
  signupDate: string;
  firstPurchaseDate?: string;
  firstPurchaseAmount?: number;
  bonusAwarded: boolean;
}

export const ReferralDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalBonusEarned: 0
  });
  const [rewards, setRewards] = useState<ReferralRewards | null>(null);
  const [referrals, setReferrals] = useState<ReferralHistory[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch referral code and stats in parallel
      const [codeData, statsData] = await Promise.all([
        apiService.getMyReferralCode(token),
        apiService.getReferralStats(token)
      ]);

      setReferralCode(codeData.referralCode);
      setShareUrl(codeData.shareUrl);
      setRewards(codeData.rewards);

      if (statsData.stats) {
        setStats(statsData.stats);
      }
      if (statsData.referrals) {
        setReferrals(statsData.referrals);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      showToast('Failed to load referral data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(`${type === 'code' ? 'Referral code' : 'Link'} copied!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Join Shaikh Jee Cosmetics and get ${rewards?.refereeBonus.value}% off your first order! Use my referral code: ${referralCode}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Get a discount at Shaikh Jee Cosmetics!';
    const body = `Hey!\n\nI've been shopping at Shaikh Jee Cosmetics and thought you'd love it too!\n\nUse my referral code "${referralCode}" to get ${rewards?.refereeBonus.value}% off your first order.\n\nSign up here: ${shareUrl}\n\nHappy shopping!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      registered: 'bg-blue-100 text-blue-700',
      purchased: 'bg-green-100 text-green-700',
      rewarded: 'bg-purple-100 text-purple-700'
    };

    const labels = {
      pending: 'Pending',
      registered: 'Signed Up',
      purchased: 'Purchased',
      rewarded: 'Completed'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <div className="p-6 border bg-gradient-to-br from-primary/5 to-secondary/30 rounded-2xl border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Your Referral Code</h3>
            <p className="text-sm text-muted-foreground">Share and earn rewards!</p>
          </div>
        </div>

        {/* Code Display */}
        <div className="flex items-center gap-3 p-4 mb-4 bg-white border rounded-xl border-primary/20">
          <span className="flex-1 text-2xl font-bold tracking-wider text-center text-primary">
            {referralCode}
          </span>
          <button
            onClick={() => copyToClipboard(referralCode, 'code')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-primary bg-primary/10 hover:bg-primary/20"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share Link */}
        <div className="flex items-center gap-2 p-3 mb-4 overflow-hidden text-sm bg-white border rounded-lg border-gray-200">
          <span className="flex-1 truncate text-muted-foreground">{shareUrl}</span>
          <button
            onClick={() => copyToClipboard(shareUrl, 'link')}
            className="flex-shrink-0 p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3">
          <button
            onClick={shareViaWhatsApp}
            className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-white transition-colors bg-green-500 rounded-xl hover:bg-green-600"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={shareViaEmail}
            className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-white transition-colors bg-blue-500 rounded-xl hover:bg-blue-600"
          >
            <Share2 className="w-4 h-4" />
            Email
          </button>
        </div>

        {/* Rewards Info */}
        {rewards && (
          <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-primary/10">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your friend gets</p>
              <p className="text-lg font-bold text-primary">
                {rewards.refereeBonus.value}
                {rewards.refereeBonus.type === 'percentage' ? '%' : ' Rs'} off
              </p>
              <p className="text-xs text-muted-foreground">first order</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">You earn</p>
              <p className="text-lg font-bold text-primary">
                {rewards.referrerBonus.value}
                {rewards.referrerBonus.type === 'points' ? ' pts' : ' Rs'}
              </p>
              <p className="text-xs text-muted-foreground">per referral</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 text-center bg-white border rounded-xl border-gray-200">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
          <p className="text-sm text-muted-foreground">Total Referrals</p>
        </div>
        <div className="p-4 text-center bg-white border rounded-xl border-gray-200">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-foreground">{stats.successfulReferrals}</p>
          <p className="text-sm text-muted-foreground">Successful</p>
        </div>
        <div className="p-4 text-center bg-white border rounded-xl border-gray-200">
          <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold text-foreground">{stats.pendingReferrals}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="p-4 text-center bg-white border rounded-xl border-gray-200">
          <Gift className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold text-foreground">{stats.totalBonusEarned}</p>
          <p className="text-sm text-muted-foreground">Points Earned</p>
        </div>
      </div>

      {/* Referral History */}
      {referrals.length > 0 && (
        <div className="p-6 bg-white border rounded-2xl border-gray-200">
          <h3 className="mb-4 text-lg font-bold text-foreground">Referral History</h3>
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {referral.referee?.name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Joined {referral.signupDate ? new Date(referral.signupDate).toLocaleDateString() : 'N/A'}
                  </p>
                  {referral.firstPurchaseAmount && (
                    <p className="text-sm text-green-600">
                      First purchase: Rs {referral.firstPurchaseAmount.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(referral.status)}
                  {referral.bonusAwarded && (
                    <p className="mt-1 text-xs text-green-600">Bonus awarded</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="p-6 bg-white border rounded-2xl border-gray-200">
        <h3 className="mb-4 text-lg font-bold text-foreground">How It Works</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold rounded-full bg-primary/10 text-primary">
              1
            </div>
            <div>
              <p className="font-medium text-foreground">Share Your Code</p>
              <p className="text-sm text-muted-foreground">Send your unique code to friends</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold rounded-full bg-primary/10 text-primary">
              2
            </div>
            <div>
              <p className="font-medium text-foreground">Friend Signs Up</p>
              <p className="text-sm text-muted-foreground">They get a discount on first order</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold rounded-full bg-primary/10 text-primary">
              3
            </div>
            <div>
              <p className="font-medium text-foreground">You Earn Points</p>
              <p className="text-sm text-muted-foreground">Get bonus points after their purchase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
