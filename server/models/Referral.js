import mongoose from 'mongoose';

/**
 * Referral Model
 * Tracks referral relationships and rewards between users
 */
const referralSchema = new mongoose.Schema({
  // The user who owns/shares this referral code
  referrer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // Unique referral code for sharing
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Reward configuration
  rewards: {
    // Reward for referrer when referee makes first purchase
    referrerBonus: {
      type: { type: String, enum: ['points', 'discount', 'percentage'], default: 'points' },
      value: { type: Number, default: 100 } // 100 points or Rs.100 or 10%
    },
    // Reward for new user (referee) on signup/first purchase
    refereeBonus: {
      type: { type: String, enum: ['points', 'discount', 'percentage'], default: 'percentage' },
      value: { type: Number, default: 10 } // 10% off first order
    }
  },

  // Statistics
  stats: {
    totalReferrals: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 }, // Referrals that made a purchase
    pendingReferrals: { type: Number, default: 0 },
    totalBonusEarned: { type: Number, default: 0 }, // In points
    totalDiscountGiven: { type: Number, default: 0 } // In rupees
  },

  // Users referred by this code
  referrals: [{
    referee: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'registered', 'purchased', 'rewarded'],
      default: 'pending'
    },
    signupDate: Date,
    firstPurchaseDate: Date,
    firstPurchaseAmount: Number,
    referrerBonusAwarded: { type: Boolean, default: false },
    refereeBonusUsed: { type: Boolean, default: false },
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Code settings
  isActive: {
    type: Boolean,
    default: true
  },

  // Maximum number of referrals allowed (null = unlimited)
  maxReferrals: {
    type: Number,
    default: null
  },

  // Expiry date for the code (null = never expires)
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
// Note: code already has unique index from schema definition
referralSchema.index({ referrer: 1 });
referralSchema.index({ 'referrals.referee': 1 });
referralSchema.index({ isActive: 1 });

/**
 * Generate a unique referral code
 */
referralSchema.statics.generateUniqueCode = async function(userName = '') {
  const prefix = userName
    ? userName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '')
    : 'REF';

  let code;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    code = `${prefix}${randomPart}`;
    exists = await this.findOne({ code });
    attempts++;
  }

  if (exists) {
    // Fallback to timestamp-based code
    code = `REF${Date.now().toString(36).toUpperCase()}`;
  }

  return code;
};

/**
 * Check if referral code is valid for use
 */
referralSchema.methods.isValidForUse = function() {
  if (!this.isActive) return { valid: false, reason: 'Code is inactive' };

  if (this.expiresAt && new Date() > this.expiresAt) {
    return { valid: false, reason: 'Code has expired' };
  }

  if (this.maxReferrals && this.stats.totalReferrals >= this.maxReferrals) {
    return { valid: false, reason: 'Code has reached maximum usage limit' };
  }

  return { valid: true };
};

/**
 * Add a new referral
 */
referralSchema.methods.addReferral = async function(refereeId) {
  // Check if referee already exists
  const existingReferral = this.referrals.find(
    r => r.referee && r.referee.toString() === refereeId.toString()
  );

  if (existingReferral) {
    return { success: false, message: 'User already referred' };
  }

  this.referrals.push({
    referee: refereeId,
    status: 'registered',
    signupDate: new Date()
  });

  this.stats.totalReferrals += 1;
  this.stats.pendingReferrals += 1;

  await this.save();
  return { success: true };
};

/**
 * Mark referral as purchased and award bonuses
 */
referralSchema.methods.completePurchase = async function(refereeId, orderId, orderAmount) {
  const referralIndex = this.referrals.findIndex(
    r => r.referee && r.referee.toString() === refereeId.toString()
  );

  if (referralIndex === -1) {
    return { success: false, message: 'Referral not found' };
  }

  const referral = this.referrals[referralIndex];

  // Only process first purchase
  if (referral.status === 'purchased' || referral.status === 'rewarded') {
    return { success: false, message: 'Referral already completed' };
  }

  referral.status = 'purchased';
  referral.firstPurchaseDate = new Date();
  referral.firstPurchaseAmount = orderAmount;
  referral.orderId = orderId;

  this.stats.successfulReferrals += 1;
  this.stats.pendingReferrals = Math.max(0, this.stats.pendingReferrals - 1);

  await this.save();
  return { success: true, referral };
};

/**
 * Mark referrer bonus as awarded
 */
referralSchema.methods.markReferrerBonusAwarded = async function(refereeId, bonusAmount) {
  const referralIndex = this.referrals.findIndex(
    r => r.referee && r.referee.toString() === refereeId.toString()
  );

  if (referralIndex === -1) return;

  this.referrals[referralIndex].referrerBonusAwarded = true;
  this.referrals[referralIndex].status = 'rewarded';
  this.stats.totalBonusEarned += bonusAmount;

  await this.save();
};

export default mongoose.model('Referral', referralSchema);
