import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendContactFormEmail } from '../utils/emailService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for contact form - 5 requests per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),
  body('inquiryType')
    .optional()
    .isIn(['General Assistance', 'Order Chronicles', 'Beauty Advice', 'Wholesale Signature', 'Returns & Refunds', 'Technical Issue'])
    .withMessage('Invalid inquiry type'),
];

// Submit contact form
router.post('/', contactLimiter, contactValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message, inquiryType } = req.body;

    // Send emails
    const result = await sendContactFormEmail({
      name,
      email,
      subject,
      message,
      inquiryType: inquiryType || 'General Assistance'
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you within 24-48 hours.'
      });
    } else {
      console.error('Contact form email error:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send your message. Please try again or contact us directly at support@shaikhjee.com'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

export default router;
