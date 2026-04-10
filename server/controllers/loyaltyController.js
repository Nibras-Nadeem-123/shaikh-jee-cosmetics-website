import LoyaltyPoint from '../models/LoyaltyPoint.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';

// Get user loyalty points
export const getLoyaltyPoints = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  
  let loyalty = await LoyaltyPoint.findOne({ userId }).populate('history.orderId', 'orderItems totalPrice');
  
  if (!loyalty) {
    // Create new loyalty account
    loyalty = await LoyaltyPoint.create({
      userId,
      points: 0,
      tier: 'bronze',
      lifetimePoints: 0,
      redeemedPoints: 0,
      nextTierPoints: 500
    });
  }
  
  res.status(200).json({
    success: true,
    loyalty: {
      points: loyalty.points,
      tier: loyalty.tier,
      lifetimePoints: loyalty.lifetimePoints,
      redeemedPoints: loyalty.redeemedPoints,
      nextTierPoints: loyalty.nextTierPoints,
      history: loyalty.history.slice(-20) // Last 20 transactions
    }
  });
});

// Redeem points for discount
export const redeemPoints = catchAsyncErrors(async (req, res, next) => {
  const { points } = req.body;
  const userId = req.user._id;
  
  if (!points || points <= 0) {
    return next(new ErrorHandler('Invalid points amount', 400));
  }
  
  let loyalty = await LoyaltyPoint.findOne({ userId });
  
  if (!loyalty) {
    return next(new ErrorHandler('Loyalty account not found', 404));
  }
  
  if (loyalty.points < points) {
    return next(new ErrorHandler('Insufficient points', 400));
  }
  
  // Calculate discount value (1 point = ₹1)
  const discountValue = points;
  
  loyalty.redeemPoints(points, `Redeemed for ₹${discountValue} discount`);
  await loyalty.save();
  
  res.status(200).json({
    success: true,
    message: `Successfully redeemed ${points} points`,
    discount: discountValue,
    remainingPoints: loyalty.points,
    tier: loyalty.tier
  });
});

// Award points for order
export const awardOrderPoints = catchAsyncErrors(async (req, res) => {
  const { userId, orderId, orderAmount } = req.body;
  
  if (!userId || !orderId || !orderAmount) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  let loyalty = await LoyaltyPoint.findOne({ userId });
  
  if (!loyalty) {
    loyalty = await LoyaltyPoint.create({
      userId,
      points: 0,
      tier: 'bronze',
      lifetimePoints: 0,
      redeemedPoints: 0,
      nextTierPoints: 500
    });
  }
  
  // Calculate points based on tier
  const points = LoyaltyPoint.calculatePoints(orderAmount, loyalty.tier);
  
  loyalty.addPoints(points, `Order #${orderId}`, orderId);
  await loyalty.save();
  
  res.status(200).json({
    success: true,
    pointsEarned: points,
    totalPoints: loyalty.points,
    tier: loyalty.tier,
    nextTierPoints: loyalty.nextTierPoints
  });
});

// Get tier information
export const getTierInfo = catchAsyncErrors(async (req, res) => {
  const tierBenefits = {
    bronze: {
      name: 'Bronze',
      multiplier: '1x',
      benefits: ['Earn 1 point per ₹10', 'Birthday bonus: 50 points'],
      nextTier: 'Silver',
      icon: '🥉'
    },
    silver: {
      name: 'Silver',
      multiplier: '1.25x',
      benefits: ['Earn 1.25 points per ₹10', 'Free shipping on orders ₹499+', 'Birthday bonus: 100 points'],
      nextTier: 'Gold',
      icon: '🥈'
    },
    gold: {
      name: 'Gold',
      multiplier: '1.5x',
      benefits: ['Earn 1.5 points per ₹10', 'Free shipping on all orders', 'Early access to sales', 'Birthday bonus: 200 points'],
      nextTier: 'Platinum',
      icon: '🥇'
    },
    platinum: {
      name: 'Platinum',
      multiplier: '2x',
      benefits: ['Earn 2 points per ₹10', 'Priority customer support', 'Exclusive platinum-only deals', 'Birthday bonus: 500 points', 'Free gifts with purchase'],
      nextTier: null,
      icon: '💎'
    }
  };
  
  res.status(200).json({
    success: true,
    tiers: tierBenefits
  });
});

// Admin: Adjust points
export const adjustPoints = catchAsyncErrors(async (req, res, next) => {
  const { userId, points, description } = req.body;
  
  if (!userId || !points) {
    return next(new ErrorHandler('User ID and points are required', 400));
  }
  
  let loyalty = await LoyaltyPoint.findOne({ userId }).populate('userId');
  
  if (!loyalty) {
    loyalty = await LoyaltyPoint.create({
      userId,
      points: 0,
      tier: 'bronze',
      lifetimePoints: 0,
      redeemedPoints: 0,
      nextTierPoints: 500
    });
  }
  
  if (points > 0) {
    loyalty.addPoints(points, description || 'Admin adjustment');
  } else if (points < 0) {
    loyalty.redeemPoints(Math.abs(points), description || 'Admin adjustment');
  }
  
  await loyalty.save();
  
  res.status(200).json({
    success: true,
    message: `Successfully ${points > 0 ? 'added' : 'deducted'} ${Math.abs(points)} points`,
    totalPoints: loyalty.points,
    tier: loyalty.tier
  });
});
