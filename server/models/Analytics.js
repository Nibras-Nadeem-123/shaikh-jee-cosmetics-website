import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  metrics: {
    revenue: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    customers: {
      type: Number,
      default: 0
    },
    products: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    }
  },
  topProducts: [{
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    name: String,
    sales: Number,
    revenue: Number
  }],
  categoryPerformance: [{
    category: String,
    sales: Number,
    revenue: Number
  }]
}, {
  timestamps: true
});

analyticsSchema.index({ date: 1 });

export default mongoose.model('Analytics', analyticsSchema);
