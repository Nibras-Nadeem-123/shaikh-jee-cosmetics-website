import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['website', 'checkout', 'popup', 'footer'],
      default: 'website'
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ subscribed: 1 });

export default mongoose.model('Newsletter', newsletterSchema);
