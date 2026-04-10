import Newsletter from '../models/Newsletter.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';

// Subscribe to newsletter
export const subscribeNewsletter = catchAsyncErrors(async (req, res, next) => {
  const { email, source = 'website' } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return next(new ErrorHandler('Please provide a valid email', 400));
  }

  // Check if already subscribed
  let newsletter = await Newsletter.findOne({ email });

  if (newsletter) {
    if (newsletter.subscribed) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed!',
        alreadySubscribed: true
      });
    }
    // Re-subscribe
    newsletter.subscribed = true;
    newsletter.subscribedAt = new Date();
    newsletter.unsubscribedAt = undefined;
    newsletter.metadata = {
      source,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };
    await newsletter.save();
  } else {
    // New subscription
    newsletter = await Newsletter.create({
      email,
      subscribed: true,
      metadata: {
        source,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter!',
    email: newsletter.email
  });
});

// Unsubscribe from newsletter
export const unsubscribeNewsletter = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return next(new ErrorHandler('Please provide a valid email', 400));
  }

  const newsletter = await Newsletter.findOne({ email });

  if (!newsletter || !newsletter.subscribed) {
    return res.status(200).json({
      success: true,
      message: 'You are not subscribed to our newsletter',
      alreadyUnsubscribed: true
    });
  }

  newsletter.subscribed = false;
  newsletter.unsubscribedAt = new Date();
  await newsletter.save();

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from newsletter',
    email: newsletter.email
  });
});

// Admin: Get all subscribers
export const getSubscribers = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 50, subscribed = true } = req.query;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
  const skip = (pageNum - 1) * limitNum;

  const subscribers = await Newsletter.find({ subscribed: subscribed === 'true' })
    .sort({ subscribedAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const totalSubscribers = await Newsletter.countDocuments({ subscribed: subscribed === 'true' });
  const totalPages = Math.ceil(totalSubscribers / limitNum);

  res.status(200).json({
    success: true,
    subscribers,
    totalSubscribers,
    totalPages,
    currentPage: pageNum
  });
});

// Admin: Export subscribers (CSV)
export const exportSubscribers = catchAsyncErrors(async (req, res) => {
  const subscribers = await Newsletter.find({ subscribed: true }).select('email subscribedAt metadata');

  const csv = [
    ['Email', 'Subscribed At', 'Source'].join(','),
    ...subscribers.map(s => 
      [s.email, s.subscribedAt.toISOString().split('T')[0], s.metadata?.source || 'website'].join(',')
    )
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
  res.send(csv);
});
