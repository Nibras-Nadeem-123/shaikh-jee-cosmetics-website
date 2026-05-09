"use client";

import React, { useState, useEffect } from 'react';
import { X, Link2, Copy, Check, Share2, Mail, MessageCircle, Loader2, Eye, Trash2, RefreshCw } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface SharedWishlist {
  shareId: string;
  title: string;
  message: string;
  productCount: number;
  viewCount: number;
  createdAt: string;
  expiresAt: string | null;
  isExpired: boolean;
}

interface WishlistShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistCount: number;
}

export const WishlistShareModal: React.FC<WishlistShareModalProps> = ({
  isOpen,
  onClose,
  wishlistCount
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sharedWishlists, setSharedWishlists] = useState<SharedWishlist[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number>(0);

  // Newly created link
  const [newShareId, setNewShareId] = useState<string | null>(null);

  // Fetch existing shared wishlists
  useEffect(() => {
    if (isOpen && activeTab === 'manage') {
      fetchSharedWishlists();
    }
  }, [isOpen, activeTab]);

  const fetchSharedWishlists = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await apiService.getMySharedWishlists(token);
      if (data.success) {
        setSharedWishlists(data.sharedWishlists);
      }
    } catch (error) {
      console.error('Failed to fetch shared wishlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShare = async () => {
    if (wishlistCount === 0) {
      showToast('Your wishlist is empty', 'error');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to share your wishlist', 'error');
        return;
      }

      const data = await apiService.createSharedWishlist({
        title: title || undefined,
        message: message || undefined,
        expiresInDays: expiresInDays > 0 ? expiresInDays : undefined
      }, token);

      if (data.success) {
        setNewShareId(data.sharedWishlist.shareId);
        showToast('Wishlist shared successfully!', 'success');
        // Reset form
        setTitle('');
        setMessage('');
        setExpiresInDays(0);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to share wishlist', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await apiService.deleteSharedWishlist(shareId, token);
      setSharedWishlists(prev => prev.filter(sw => sw.shareId !== shareId));
      showToast('Shared link deleted', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete', 'error');
    }
  };

  const getShareUrl = (shareId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/wishlist/shared/${shareId}`;
  };

  const handleCopyLink = async (shareId: string) => {
    const url = getShareUrl(shareId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(shareId);
      showToast('Link copied!', 'success');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleShareVia = (shareId: string, platform: 'whatsapp' | 'email') => {
    const url = getShareUrl(shareId);
    const text = 'Check out my wishlist!';

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent('My Wishlist')}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share Wishlist</h2>
              <p className="text-sm text-gray-500">{wishlistCount} items in your wishlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'create' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Link
            {activeTab === 'create' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'manage' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Links
            {sharedWishlists.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {sharedWishlists.length}
              </span>
            )}
            {activeTab === 'manage' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Create Tab */}
          {activeTab === 'create' && (
            <div className="space-y-5">
              {/* Success State - Show Link */}
              {newShareId ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Wishlist shared!</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Your wishlist link is ready to share.
                    </p>
                  </div>

                  {/* Share Link */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2">Share this link:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={getShareUrl(newShareId)}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                      />
                      <button
                        onClick={() => handleCopyLink(newShareId)}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {copied === newShareId ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleShareVia(newShareId, 'whatsapp')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareVia(newShareId, 'email')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <Mail size={18} />
                      Email
                    </button>
                  </div>

                  <button
                    onClick={() => setNewShareId(null)}
                    className="w-full py-2 text-sm text-primary hover:underline"
                  >
                    Create another link
                  </button>
                </div>
              ) : (
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Favorites"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Check out these products I love!"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>

                  {/* Expiration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link expires in
                    </label>
                    <select
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value={0}>Never</option>
                      <option value={1}>1 day</option>
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreateShare}
                    disabled={creating || wishlistCount === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-5 h-5" />
                        Create Shareable Link
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : sharedWishlists.length === 0 ? (
                <div className="text-center py-12">
                  <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No shared links yet</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 text-primary hover:underline text-sm"
                  >
                    Create your first link
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">
                      {sharedWishlists.length} shared link{sharedWishlists.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={fetchSharedWishlists}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  {sharedWishlists.map((sw) => (
                    <div
                      key={sw.shareId}
                      className={`p-4 border rounded-xl ${
                        sw.isExpired ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{sw.title}</h4>
                          <p className="text-xs text-gray-500">
                            {sw.productCount} items • {sw.viewCount} views
                          </p>
                        </div>
                        {sw.isExpired && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                            Expired
                          </span>
                        )}
                      </div>

                      {!sw.isExpired && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleCopyLink(sw.shareId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            {copied === sw.shareId ? <Check size={14} /> : <Copy size={14} />}
                            Copy
                          </button>
                          <button
                            onClick={() => handleShareVia(sw.shareId, 'whatsapp')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </button>
                          <button
                            onClick={() => window.open(getShareUrl(sw.shareId), '_blank')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteShare(sw.shareId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors ml-auto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistShareModal;
