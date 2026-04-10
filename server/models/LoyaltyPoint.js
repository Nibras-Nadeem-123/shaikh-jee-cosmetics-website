import mongoose from 'mongoose';

const loyaltyPointSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  history: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'adjusted']
    },
    points: Number,
    description: String,
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lifetimePoints: {
    type: Number,
    default: 0
  },
  redeemedPoints: {
    type: Number,
    default: 0
  },
  nextTierPoints: {
    type: Number,
    default: 500 // Points needed for next tier
  }
}, {
  timestamps: true
});

// Indexes
loyaltyPointSchema.index({ userId: 1 });
loyaltyPointSchema.index({ tier: 1 });
loyaltyPointSchema.index({ points: -1 });

// Tier thresholds
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 5000
};

// Update tier based on lifetime points
loyaltyPointSchema.methods.updateTier = function() {
  const lifetime = this.lifetimePoints;
  
  if (lifetime >= TIER_THRESHOLDS.platinum) {
    this.tier = 'platinum';
    this.nextTierPoints = 0; // Max tier
  } else if (lifetime >= TIER_THRESHOLDS.gold) {
    this.tier = 'gold';
    this.nextTierPoints = TIER_THRESHOLDS.platinum - lifetime;
  } else if (lifetime >= TIER_THRESHOLDS.silver) {
    this.tier = 'silver';
    this.nextTierPoints = TIER_THRESHOLDS.gold - lifetime;
  } else {
    this.tier = 'bronze';
    this.nextTierPoints = TIER_THRESHOLDS.silver - lifetime;
  }
  
  return this;
};

// Add points
loyaltyPointSchema.methods.addPoints = function(points, description, orderId = null) {
  this.points += points;
  this.lifetimePoints += points;
  this.history.push({
    type: 'earned',
    points,
    description,
    orderId
  });
  this.updateTier();
  return this;
};

// Redeem points
loyaltyPointSchema.methods.redeemPoints = function(points, description) {
  if (this.points < points) {
    throw new Error('Insufficient points');
  }
  
  this.points -= points;
  this.redeemedPoints += points;
  this.history.push({
    type: 'redeemed',
    points: -points,
    description
  });
  return this;
};

// Points earning rules
loyaltyPointSchema.statics.calculatePoints = function(orderAmount, tier = 'bronze') {
  const baseRate = 1; // 1 point per ₹10
  const tierMultipliers = {
    bronze: 1,
    silver: 1.25,
    gold: 1.5,
    platinum: 2
  };
  
  const points = Math.floor((orderAmount / 10) * baseRate * tierMultipliers[tier]);
  return points;
};

export default mongoose.model('LoyaltyPoint', loyaltyPointSchema);
