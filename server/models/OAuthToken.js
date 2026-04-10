import mongoose from 'mongoose';

const oauthTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['google', 'facebook'],
    required: true
  },
  providerId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours
  }
});

oauthTokenSchema.index({ provider: 1, providerId: 1 }, { unique: true });
oauthTokenSchema.index({ userId: 1 });

export default mongoose.model('OAuthToken', oauthTokenSchema);
