import Referral from '../models/Referral.js';
import User from '../models/User.js';
import LoyaltyPoint from '../models/LoyaltyPoint.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';

// Default reward configuration
const DEFAULT_REWARDS = {
  referrerBonus: { type: 'points', value: 100 }, // 100 loyalty points
  refereeBonus: { type: 'percentage', value: 10 } // 10% off first order
};

/**
 * Get or create user's referral code
 * GET /api/referral/code
 */
export const getMyReferralCode = catchAsyncErrors(async (req, res) => {
  let referral = await Referral.findOne({ referrer: req.user._id });

  // Create referral code if doesn't exist
  if (!referral) {
    const code = await Referral.generateUniqueCode(req.user.name);

    referral = await Referral.create({
      referrer: req.user._id,
      code,
      rewards: DEFAULT_REWARDS
    });
  }

  const shareUrl = `${process.env.FRONTEND_URL || 'https://shaikhjee.com'}/signup?ref=${referral.code}`;

  res.status(200).json({
    success: true,
    referralCode: referral.code,
    shareUrl,
    rewards: referral.rewards,
    stats: referral.stats,
    isActive: referral.isActive
  });
});

/**
 * Get referral statistics and history
 * GET /api/referral/stats
 */
export const getReferralStats = catchAsyncErrors(async (req, res) => {
  const referral = await Referral.findOne({ referrer: req.user._id })
    .populate('referrals.referee', 'name email createdAt')
    .populate('referrals.orderId', 'orderNumber totalPrice');

  if (!referral) {
    return res.status(200).json({
      success: true,
      stats: {
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalBonusEarned: 0
      },
      referrals: []
    });
  }

  // Format referral history for display
  const referralHistory = referral.referrals.map(ref => ({
    id: ref._id,
    referee: ref.referee ? {
      name: ref.referee.name,
      joinedAt: ref.signupDate
    } : null,
    status: ref.status,
    signupDate: ref.signupDate,
    firstPurchaseDate: ref.firstPurchaseDate,
    firstPurchaseAmount: ref.firstPurchaseAmount,
    bonusAwarded: ref.referrerBonusAwarded,
    orderNumber: ref.orderId?.orderNumber
  }));

  res.status(200).json({
    success: true,
    code: referral.code,
    stats: referral.stats,
    rewards: referral.rewards,
    referrals: referralHistory
  });
});

/**
 * Validate a referral code (for signup)
 * POST /api/referral/validate
 */
export const validateReferralCode = catchAsyncErrors(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return next(new ErrorHandler('Referral code is required', 400));
  }

  const referral = await Referral.findOne({ code: code.toUpperCase() })
    .populate('referrer', 'name');

  if (!referral) {
    return next(new ErrorHandler('Invalid referral code', 404));
  }

  const validation = referral.isValidForUse();
  if (!validation.valid) {
    return next(new ErrorHandler(validation.reason, 400));
  }

  res.status(200).json({
    success: true,
    valid: true,
    referrerName: referral.referrer.name,
    refereeBonus: referral.rewards.refereeBonus,
    message: `You'll get ${referral.rewards.refereeBonus.value}${referral.rewards.refereeBonus.type === 'percentage' ? '%' : ''} off your first order!`
  });
});

/**
 * Apply referral code during signup
 * Called internally after user registration
 */
export const applyReferralOnSignup = async (userId, referralCode) => {
  if (!referralCode) return { success: false };

  try {
    const referral = await Referral.findOne({ code: referralCode.toUpperCase() });

    if (!referral) {
      return { success: false, message: 'Invalid referral code' };
    }

    const validation = referral.isValidForUse();
    if (!validation.valid) {
      return { success: false, message: validation.reason };
    }

    // Prevent self-referral
    if (referral.referrer.toString() === userId.toString()) {
      return { success: false, message: 'Cannot use your own referral code' };
    }

    // Add referral
    const result = await referral.addReferral(userId);

    if (result.success) {
      // Update user with referral info
      await User.findByIdAndUpdate(userId, {
        referredBy: referral.referrer,
        referralCodeUsed: referralCode.toUpperCase()
      });

      return {
        success: true,
        refereeBonus: referral.rewards.refereeBonus
      };
    }

    return result;
  } catch (error) {
    console.error('Apply referral error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get referee discount for checkout
 * GET /api/referral/discount
 */
export const getRefereeDiscount = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Check if user was referred and hasn't used discount yet
  if (!user.referralCodeUsed || user.hasUsedReferralDiscount) {
    return res.status(200).json({
      success: true,
      hasDiscount: false
    });
  }

  const referral = await Referral.findOne({ code: user.referralCodeUsed });

  if (!referral) {
    return res.status(200).json({
      success: true,
      hasDiscount: false
    });
  }

  res.status(200).json({
    success: true,
    hasDiscount: true,
    discount: referral.rewards.refereeBonus,
    message: `Welcome discount: ${referral.rewards.refereeBonus.value}${referral.rewards.refereeBonus.type === 'percentage' ? '%' : ' Rs'} off!`
  });
});

/**
 * Calculate referral discount for order
 * POST /api/referral/calculate-discount
 */
export const calculateReferralDiscount = catchAsyncErrors(async (req, res) => {
  const { orderAmount } = req.body;
  const user = await User.findById(req.user._id);

  if (!user.referralCodeUsed || user.hasUsedReferralDiscount) {
    return res.status(200).json({
      success: true,
      applicable: false,
      discountAmount: 0
    });
  }

  const referral = await Referral.findOne({ code: user.referralCodeUsed });

  if (!referral) {
    return res.status(200).json({
      success: true,
      applicable: false,
      discountAmount: 0
    });
  }

  const bonus = referral.rewards.refereeBonus;
  let discountAmount = 0;

  if (bonus.type === 'percentage') {
    discountAmount = Math.round((orderAmount * bonus.value) / 100);
  } else if (bonus.type === 'discount') {
    discountAmount = Math.min(bonus.value, orderAmount);
  } else if (bonus.type === 'points') {
    // Points are added after purchase, not as discount
    discountAmount = 0;
  }

  // Cap discount at order amount
  discountAmount = Math.min(discountAmount, orderAmount);

  res.status(200).json({
    success: true,
    applicable: true,
    discountType: bonus.type,
    discountValue: bonus.value,
    discountAmount,
    message: `Referral discount: Rs.${discountAmount} off`
  });
});

/**
 * Process referral rewards after first purchase
 * Called internally after order completion
 */
export const processReferralRewards = async (userId, orderId, orderAmount) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.referralCodeUsed || user.hasUsedReferralDiscount) {
      return { success: false, reason: 'No pending referral reward' };
    }

    const referral = await Referral.findOne({ code: user.referralCodeUsed });

    if (!referral) {
      return { success: false, reason: 'Referral code not found' };
    }

    // Mark purchase as complete
    await referral.completePurchase(userId, orderId, orderAmount);

    // Award referrer bonus (loyalty points)
    const referrerBonus = referral.rewards.referrerBonus;

    if (referrerBonus.type === 'points' && referrerBonus.value > 0) {
      let referrerLoyalty = await LoyaltyPoint.findOne({ userId: referral.referrer });

      if (!referrerLoyalty) {
        referrerLoyalty = await LoyaltyPoint.create({
          userId: referral.referrer,
          points: 0,
          tier: 'bronze',
          lifetimePoints: 0,
          redeemedPoints: 0
        });
      }

      referrerLoyalty.addPoints(
        referrerBonus.value,
        `Referral bonus - New customer purchase`,
        orderId
      );
      await referrerLoyalty.save();

      // Mark bonus as awarded
      await referral.markReferrerBonusAwarded(userId, referrerBonus.value);
    }

    // Mark user as having used referral discount
    await User.findByIdAndUpdate(userId, {
      hasUsedReferralDiscount: true
    });

    // Update referral stats
    referral.stats.totalDiscountGiven += orderAmount * (referral.rewards.refereeBonus.value / 100);
    await referral.save();

    return {
      success: true,
      referrerBonusAwarded: referrerBonus.value
    };
  } catch (error) {
    console.error('Process referral rewards error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Admin: Get all referral statistics
 * GET /api/referral/admin/stats
 */
export const getAdminReferralStats = catchAsyncErrors(async (req, res) => {
  const totalReferrals = await Referral.aggregate([
    {
      $group: {
        _id: null,
        totalCodes: { $sum: 1 },
        totalReferrals: { $sum: '$stats.totalReferrals' },
        successfulReferrals: { $sum: '$stats.successfulReferrals' },
        totalBonusAwarded: { $sum: '$stats.totalBonusEarned' },
        totalDiscountGiven: { $sum: '$stats.totalDiscountGiven' }
      }
    }
  ]);

  // Top referrers
  const topReferrers = await Referral.find({ 'stats.successfulReferrals': { $gt: 0 } })
    .populate('referrer', 'name email')
    .sort({ 'stats.successfulReferrals': -1 })
    .limit(10)
    .select('referrer code stats');

  // Recent referrals
  const recentReferrals = await Referral.aggregate([
    { $unwind: '$referrals' },
    { $sort: { 'referrals.createdAt': -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'users',
        localField: 'referrals.referee',
        foreignField: '_id',
        as: 'refereeUser'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'referrer',
        foreignField: '_id',
        as: 'referrerUser'
      }
    },
    {
      $project: {
        referrer: { $arrayElemAt: ['$referrerUser.name', 0] },
        referee: { $arrayElemAt: ['$refereeUser.name', 0] },
        status: '$referrals.status',
        signupDate: '$referrals.signupDate',
        purchaseAmount: '$referrals.firstPurchaseAmount'
      }
    }
  ]);

  res.status(200).json({
    success: true,
    overview: totalReferrals[0] || {
      totalCodes: 0,
      totalReferrals: 0,
      successfulReferrals: 0,
      totalBonusAwarded: 0,
      totalDiscountGiven: 0
    },
    topReferrers,
    recentReferrals
  });
});

/**
 * Admin: Update referral rewards configuration
 * PUT /api/referral/admin/rewards
 */
export const updateReferralRewards = catchAsyncErrors(async (req, res, next) => {
  const { referrerBonus, refereeBonus } = req.body;

  // Validate reward types
  const validTypes = ['points', 'discount', 'percentage'];

  if (referrerBonus?.type && !validTypes.includes(referrerBonus.type)) {
    return next(new ErrorHandler('Invalid referrer bonus type', 400));
  }

  if (refereeBonus?.type && !validTypes.includes(refereeBonus.type)) {
    return next(new ErrorHandler('Invalid referee bonus type', 400));
  }

  // Update all active referral codes with new rewards
  const updateData = {};
  if (referrerBonus) updateData['rewards.referrerBonus'] = referrerBonus;
  if (refereeBonus) updateData['rewards.refereeBonus'] = refereeBonus;

  await Referral.updateMany(
    { isActive: true },
    { $set: updateData }
  );

  res.status(200).json({
    success: true,
    message: 'Referral rewards updated successfully'
  });
});

export default {
  getMyReferralCode,
  getReferralStats,
  validateReferralCode,
  applyReferralOnSignup,
  getRefereeDiscount,
  calculateReferralDiscount,
  processReferralRewards,
  getAdminReferralStats,
  updateReferralRewards
};
