/**
 * Abandoned Cart Recovery Service
 * Handles detection, notification, and recovery of abandoned shopping carts
 */

import Cart from '../models/Cart.js';
import nodemailer from 'nodemailer';

// Email transporter configuration
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Configuration for reminder intervals (in hours)
const REMINDER_SCHEDULE = {
  first: 1,    // First reminder after 1 hour
  second: 24,  // Second reminder after 24 hours
  third: 72    // Third reminder after 72 hours (3 days)
};

/**
 * Process all abandoned carts and send reminders
 */
export const processAbandonedCarts = async () => {
  const results = {
    processed: 0,
    emailsSent: 0,
    errors: []
  };

  try {
    // Find carts abandoned for more than 1 hour
    const abandonedCarts = await Cart.findAbandonedCarts(1, 3);

    for (const cart of abandonedCarts) {
      try {
        // Skip if no user email
        if (!cart.userId?.email) continue;

        // Check if it's time for a reminder
        const shouldSendReminder = checkReminderTiming(cart);
        if (!shouldSendReminder) continue;

        // Mark as abandoned if not already
        if (!cart.abandonedCart.isAbandoned) {
          await cart.markAsAbandoned();
        }

        // Send reminder email
        await sendAbandonedCartEmail(cart);

        // Record that reminder was sent
        await cart.recordReminderSent();

        results.emailsSent++;
      } catch (error) {
        results.errors.push({
          cartId: cart._id,
          error: error.message
        });
      }

      results.processed++;
    }
  } catch (error) {
    results.errors.push({ general: error.message });
  }

  return results;
};

/**
 * Check if it's time to send a reminder based on schedule
 */
const checkReminderTiming = (cart) => {
  const now = new Date();
  const lastUpdate = cart.lastUpdated;
  const remindersSent = cart.abandonedCart.remindersSent || 0;
  const lastReminderSent = cart.abandonedCart.lastReminderSent;

  const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  const hoursSinceLastReminder = lastReminderSent
    ? (now - lastReminderSent) / (1000 * 60 * 60)
    : Infinity;

  switch (remindersSent) {
    case 0:
      return hoursSinceUpdate >= REMINDER_SCHEDULE.first;
    case 1:
      return hoursSinceLastReminder >= (REMINDER_SCHEDULE.second - REMINDER_SCHEDULE.first);
    case 2:
      return hoursSinceLastReminder >= (REMINDER_SCHEDULE.third - REMINDER_SCHEDULE.second);
    default:
      return false; // Max reminders sent
  }
};

/**
 * Send abandoned cart reminder email
 */
const sendAbandonedCartEmail = async (cart) => {
  const transporter = getTransporter();
  const user = cart.userId;
  const recoveryUrl = `${process.env.FRONTEND_URL}/cart/recover/${cart.abandonedCart.recoveryToken}`;

  // Calculate cart total
  const cartTotal = cart.items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  // Generate items HTML
  const itemsHtml = cart.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.product.image}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.product.name}
        ${item.shade ? `<br><small>Shade: ${item.shade.name}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        Rs. ${item.product.price * item.quantity}
      </td>
    </tr>
  `).join('');

  const reminderNumber = (cart.abandonedCart.remindersSent || 0) + 1;
  const subject = getEmailSubject(reminderNumber);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF87;">Shaikh Jee Cosmetics</h1>
      </div>

      <h2 style="color: #333;">Hi ${user.name},</h2>

      <p>${getEmailIntro(reminderNumber)}</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Name</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 15px; text-align: right; font-weight: bold; color: #D4AF87;">Rs. ${cartTotal}</td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${recoveryUrl}" style="background-color: #D4AF87; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Complete Your Purchase
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        ${getEmailOutro(reminderNumber)}
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

      <p style="color: #999; font-size: 12px; text-align: center;">
        If you no longer wish to receive these emails, you can unsubscribe in your account settings.<br>
        &copy; ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.
      </p>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Shaikh Jee Cosmetics" <noreply@shaikhjee.com>',
    to: user.email,
    subject,
    html: emailHtml
  });
};

/**
 * Get email subject based on reminder number
 */
const getEmailSubject = (reminderNumber) => {
  switch (reminderNumber) {
    case 1:
      return "You left something behind!";
    case 2:
      return "Your cart misses you!";
    case 3:
      return "Last chance! Your cart is expiring soon";
    default:
      return "Complete your purchase at Shaikh Jee Cosmetics";
  }
};

/**
 * Get email intro text based on reminder number
 */
const getEmailIntro = (reminderNumber) => {
  switch (reminderNumber) {
    case 1:
      return "We noticed you left some amazing products in your cart. Don't worry, we've saved them for you!";
    case 2:
      return "Your cart is still waiting for you! These beautiful products are calling your name.";
    case 3:
      return "This is your last reminder! Your cart items are about to expire. Don't miss out on these gorgeous products!";
    default:
      return "You have items waiting in your cart!";
  }
};

/**
 * Get email outro text based on reminder number
 */
const getEmailOutro = (reminderNumber) => {
  switch (reminderNumber) {
    case 1:
      return "Need help? Feel free to reply to this email or contact our customer support.";
    case 2:
      return "Having second thoughts? Our team is here to help you choose the perfect products!";
    case 3:
      return "Act now before your cart expires! Contact us if you have any questions.";
    default:
      return "Thank you for shopping with us!";
  }
};

/**
 * Recover a cart using recovery token
 */
export const recoverCart = async (recoveryToken, userId) => {
  const cart = await Cart.findByRecoveryToken(recoveryToken);

  if (!cart) {
    throw new Error('Invalid or expired recovery link');
  }

  // If user is logged in, transfer cart items
  if (userId && cart.userId.toString() !== userId.toString()) {
    // Merge items into user's cart
    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      userCart = new Cart({ userId, items: [] });
    }

    // Add recovered items to user's cart
    for (const item of cart.items) {
      const existingItem = userCart.items.find(
        i => i.product.toString() === item.product.toString() &&
             i.shade?.name === item.shade?.name
      );

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        userCart.items.push(item);
      }
    }

    await userCart.save();
    await cart.markAsRecovered();
    return userCart;
  }

  // Mark original cart as recovered
  await cart.markAsRecovered();
  return cart;
};

export default {
  processAbandonedCarts,
  recoverCart
};
