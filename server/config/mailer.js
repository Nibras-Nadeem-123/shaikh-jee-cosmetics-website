import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender address (must be verified in Resend or use onboarding@resend.dev for testing)
const FROM_EMAIL = process.env.FROM_EMAIL || 'Shaikh Jee Cosmetics <onboarding@resend.dev>';

// Verify connection on startup
const verifyEmailService = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.log('Email service not configured: RESEND_API_KEY is missing');
    return;
  }
  console.log('Email service ready (Resend)');
};

verifyEmailService();

// Send order confirmation email
export const sendOrderConfirmationEmail = async (user, order) => {
  try {
    const orderItems = order.orderItems
      .map(item => `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">Rs.${item.price}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">Rs.${item.price * item.quantity}</td>
      </tr>`)
      .join('');

    const htmlContent = `
      <h2>Order Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for your order! Your order has been received and is being processed.</p>

      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>

      <h3>Items:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
        </tr>
        ${orderItems}
      </table>

      <h3>Price Summary:</h3>
      <p>Subtotal: Rs.${order.itemsPrice}</p>
      <p>Shipping: Rs.${order.shippingPrice}</p>
      <p><strong>Total: Rs.${order.totalPrice}</strong></p>

      <h3>Shipping Address:</h3>
      <p>
        ${order.shippingAddress.name}<br/>
        ${order.shippingAddress.addressLine1}<br/>
        ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br/>' : ''}
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}
      </p>

      <p>You can track your order status on our website.</p>
      <p>If you have any questions, please contact us.</p>
      <p>Best regards,<br/>Shaikh Jee Cosmetics Team</p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: htmlContent
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
      throw new Error('Email sending failed. Please try again later.');
    }

    console.log('Order confirmation email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
    throw new Error('Email sending failed. Please try again later.');
  }
};

// Send order status update email
export const sendOrderStatusEmail = async (user, order, newStatus) => {
  try {
    const statusMessages = {
      processing: 'Your order is being prepared',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled'
    };

    const htmlContent = `
      <h2>Order Status Update</h2>
      <p>Dear ${user.name},</p>
      <p>${statusMessages[newStatus]}</p>

      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>New Status:</strong> ${newStatus.toUpperCase()}</p>

      <p>You can track your order on our website.</p>
      <p>Best regards,<br/>Shaikh Jee Cosmetics Team</p>
    `;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `Order Status Update - Order #${order._id}`,
      html: htmlContent
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Order status email sent to:', user.email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br/>Shaikh Jee Cosmetics Team</p>
    `;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  try {
    const htmlContent = `
      <h2>Welcome to Shaikh Jee Cosmetics!</h2>
      <p>Dear ${user.name},</p>
      <p>Welcome to our cosmetics store! We're excited to have you as a customer.</p>

      <h3>What's Next?</h3>
      <ul>
        <li>Browse our collection of premium products</li>
        <li>Add items to your wishlist for later</li>
        <li>Check out our latest offers</li>
      </ul>

      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br/>Shaikh Jee Cosmetics Team</p>
    `;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Welcome to Shaikh Jee Cosmetics',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
