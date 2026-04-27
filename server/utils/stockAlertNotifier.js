import StockAlert from '../models/StockAlert.js';
import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS
    }
  });
};

/**
 * Send back in stock notification emails
 * @param {string} productId - The product ID
 * @param {object} product - The product object
 */
export const sendBackInStockNotifications = async (productId, product) => {
  try {
    // Get all subscribers who haven't been notified
    const subscribers = await StockAlert.getSubscribers(productId);

    if (subscribers.length === 0) {
      console.log(`No subscribers to notify for product: ${product.name}`);
      return { success: true, notified: 0 };
    }

    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const productUrl = `${frontendUrl}/product/${product.slug}`;

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      const mailOptions = {
        from: `"Shaikh Jee Cosmetics" <${process.env.SMTP_USER}>`,
        to: subscriber.email,
        subject: `Good News! ${product.name} is Back in Stock!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #D4AF87, #C5A078); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .product-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
                .product-image { max-width: 200px; height: auto; border-radius: 8px; margin-bottom: 15px; }
                .product-name { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px; }
                .button { display: inline-block; background: #D4AF87; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
                .button:hover { background: #C5A078; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .unsubscribe { color: #999; font-size: 11px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>It's Back!</h1>
                  <p>The product you've been waiting for is now available</p>
                </div>
                <div class="content">
                  <p>Hi there,</p>

                  <p>Great news! The product you wanted is back in stock and ready to be yours.</p>

                  <div class="product-card">
                    ${product.images?.[0] ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image" />` : ''}
                    <div class="product-name">${product.name}</div>
                    <div style="color: #D4AF87; font-size: 24px; font-weight: bold;">Rs.${product.price}</div>
                  </div>

                  <p style="text-align: center;">
                    <a href="${productUrl}" class="button">Shop Now</a>
                  </p>

                  <p>Hurry! Popular items sell out quickly.</p>

                  <p>Best regards,<br/>The Shaikh Jee Cosmetics Team</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.</p>
                  <p class="unsubscribe">
                    You received this email because you requested to be notified when this product is back in stock.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Back in stock notification sent to: ${subscriber.email}`);
        return { email: subscriber.email, success: true };
      } catch (error) {
        console.error(`Failed to send notification to ${subscriber.email}:`, error);
        return { email: subscriber.email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);

    // Mark all as notified
    await StockAlert.markAsNotified(productId);

    const successCount = results.filter(r => r.success).length;
    console.log(`Back in stock notifications sent: ${successCount}/${subscribers.length}`);

    return {
      success: true,
      notified: successCount,
      total: subscribers.length,
      results
    };
  } catch (error) {
    console.error('Error sending back in stock notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if product needs notifications to be sent
 * Call this when product stock is updated
 * @param {object} product - The product with old and new stock values
 */
export const checkAndNotifyStockUpdate = async (product, previousQuantity = 0) => {
  try {
    // If product was out of stock and now has stock
    const currentQuantity = product.quantity || 0;
    const isNowInStock = currentQuantity > 0 || product.inStock;
    const wasOutOfStock = previousQuantity <= 0;

    if (isNowInStock && wasOutOfStock) {
      console.log(`Product ${product.name} is back in stock. Sending notifications...`);
      return await sendBackInStockNotifications(product._id, product);
    }

    return { success: true, notified: 0, message: 'No notifications needed' };
  } catch (error) {
    console.error('Error checking stock update:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendBackInStockNotifications,
  checkAndNotifyStockUpdate
};
