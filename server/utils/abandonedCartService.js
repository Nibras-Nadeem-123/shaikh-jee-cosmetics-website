/**
 * Abandoned Cart Recovery Service
 * Handles detection, notification, and recovery of abandoned shopping carts
 */

import Cart from '../models/Cart.js';
import { sendAbandonedCartEmail } from './email.js';

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
    // Find carts abandoned for more than 1 hour with less than 3 reminders
    const abandonedCarts = await Cart.findAbandonedCarts(1, 3);

    console.log(`[AbandonedCart] Found ${abandonedCarts.length} abandoned carts to process`);

    for (const cart of abandonedCarts) {
      try {
        // Skip if no user email
        if (!cart.userId?.email) {
          console.log(`[AbandonedCart] Skipping cart ${cart._id} - no user email`);
          continue;
        }

        // Skip if cart is empty
        if (!cart.items || cart.items.length === 0) {
          console.log(`[AbandonedCart] Skipping cart ${cart._id} - empty cart`);
          continue;
        }

        // Check if it's time for a reminder
        const shouldSendReminder = checkReminderTiming(cart);
        if (!shouldSendReminder) {
          continue;
        }

        // Mark as abandoned if not already
        if (!cart.abandonedCart.isAbandoned) {
          await cart.markAsAbandoned();
        }

        // Calculate cart total
        const cartTotal = cart.items.reduce((sum, item) => {
          const price = item.product?.price || 0;
          return sum + (price * item.quantity);
        }, 0);

        // Generate recovery URL
        const recoveryUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart/recover/${cart.abandonedCart.recoveryToken}`;

        // Determine reminder number (1, 2, or 3)
        const reminderNumber = (cart.abandonedCart.remindersSent || 0) + 1;

        // Send reminder email using Brevo
        await sendAbandonedCartEmail({
          to: cart.userId.email,
          userName: cart.userId.name,
          items: cart.items,
          cartTotal,
          recoveryUrl,
          reminderNumber
        });

        // Record that reminder was sent
        await cart.recordReminderSent();

        console.log(`[AbandonedCart] Sent reminder #${reminderNumber} to ${cart.userId.email}`);
        results.emailsSent++;
      } catch (error) {
        console.error(`[AbandonedCart] Error processing cart ${cart._id}:`, error.message);
        results.errors.push({
          cartId: cart._id,
          error: error.message
        });
      }

      results.processed++;
    }
  } catch (error) {
    console.error('[AbandonedCart] General error:', error.message);
    results.errors.push({ general: error.message });
  }

  console.log(`[AbandonedCart] Processing complete: ${results.emailsSent} emails sent, ${results.errors.length} errors`);
  return results;
};

/**
 * Check if it's time to send a reminder based on schedule
 */
const checkReminderTiming = (cart) => {
  const now = new Date();
  const lastUpdate = new Date(cart.lastUpdated);
  const remindersSent = cart.abandonedCart.remindersSent || 0;
  const lastReminderSent = cart.abandonedCart.lastReminderSent
    ? new Date(cart.abandonedCart.lastReminderSent)
    : null;

  const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  const hoursSinceLastReminder = lastReminderSent
    ? (now - lastReminderSent) / (1000 * 60 * 60)
    : Infinity;

  switch (remindersSent) {
    case 0:
      // First reminder: 1 hour after cart abandonment
      return hoursSinceUpdate >= REMINDER_SCHEDULE.first;
    case 1:
      // Second reminder: 24 hours after first reminder
      return hoursSinceLastReminder >= (REMINDER_SCHEDULE.second - REMINDER_SCHEDULE.first);
    case 2:
      // Third reminder: 48 hours after second reminder (72 - 24)
      return hoursSinceLastReminder >= (REMINDER_SCHEDULE.third - REMINDER_SCHEDULE.second);
    default:
      // Max reminders sent
      return false;
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

  // If the recovery token belongs to the same user, just return the cart
  if (userId && cart.userId.toString() === userId.toString()) {
    await cart.markAsRecovered();
    return { cart, merged: false };
  }

  // If user is logged in with a different account, merge items
  if (userId && cart.userId.toString() !== userId.toString()) {
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
        userCart.items.push({
          product: item.product,
          quantity: item.quantity,
          shade: item.shade
        });
      }
    }

    await userCart.save();
    await cart.markAsRecovered();
    return { cart: userCart, merged: true };
  }

  // Mark original cart as recovered (for anonymous or same user)
  await cart.markAsRecovered();
  return { cart, merged: false };
};

/**
 * Get cart details by recovery token (for frontend display)
 */
export const getCartByRecoveryToken = async (recoveryToken) => {
  const cart = await Cart.findByRecoveryToken(recoveryToken);

  if (!cart) {
    return null;
  }

  return cart;
};

export default {
  processAbandonedCarts,
  recoverCart,
  getCartByRecoveryToken
};
