import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  resetToken: {
    type: String,
    required: true
  },
  resetTokenExpiry: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for cleanup
passwordResetSchema.index({ resetTokenExpiry: 1 }, { expireAfterSeconds: 0 });

// Generate reset token
passwordResetSchema.statics.generateToken = async function(userId) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  
  await this.findOneAndUpdate(
    { userId },
    {
      userId,
      resetToken,
      resetTokenExpiry,
      used: false,
      createdAt: new Date()
    },
    { upsert: true }
  );
  
  return resetToken;
};

// Verify reset token
passwordResetSchema.statics.verifyToken = async function(resetToken) {
  const resetRequest = await this.findOne({
    resetToken,
    resetTokenExpiry: { $gt: new Date() },
    used: false
  }).populate('userId');
  
  return resetRequest;
};

// Mark token as used
passwordResetSchema.methods.markAsUsed = async function() {
  this.used = true;
  await this.save();
};

export default mongoose.model('PasswordReset', passwordResetSchema);
