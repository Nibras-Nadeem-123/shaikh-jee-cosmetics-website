import nodemailer from 'nodemailer';

// Get email credentials from environment variables
const EMAIL_USER = process.env.SMTP_USER;
const EMAIL_PASS = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

// Create transporter
const createTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('Email configuration is missing. Set SMTP_USER and SMTP_PASS/SMTP_PASSWORD in environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    connectionTimeout: 10000,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Shaikh Jee Cosmetics',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4AF87, #C5A078); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #D4AF87; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'there'},</p>

              <p>We received a request to reset your password for your Shaikh Jee Cosmetics account.</p>

              <p>Click the button below to reset your password:</p>

              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #D4AF87;">${resetUrl}</p>

              <p><strong>This link will expire in 1 hour.</strong></p>

              <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>

              <p>Best regards,<br/>The Shaikh Jee Cosmetics Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`,
    to: order.userEmail,
    subject: `Order Confirmation - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4AF87, #C5A078); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your purchase</p>
            </div>
            <div class="content">
              <p>Hi ${order.userName},</p>

              <p>Your order has been confirmed and is being processed!</p>

              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> #${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> Rs.${order.totalPrice}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

                <h4>Items Ordered:</h4>
                <table>
                  ${order.orderItems.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>Qty: ${item.quantity}</td>
                      <td>Rs.${item.price}</td>
                    </tr>
                  `).join('')}
                </table>

                <p><strong>Shipping Address:</strong></p>
                <p>${order.shippingAddress.addressLine1}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>
              </div>

              <p>We'll send you another email when your order ships.</p>

              <p>Thank you for choosing Shaikh Jee Cosmetics!</p>

              <p>Best regards,<br/>The Shaikh Jee Cosmetics Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, userName) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Shaikh Jee Cosmetics!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4AF87, #C5A078); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { padding: 30px 20px; }
            .button { display: inline-block; background: #D4AF87; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Shaikh Jee!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'there'},</p>

              <p>Welcome to the Shaikh Jee Cosmetics family! We're thrilled to have you on board.</p>

              <p>As a welcome gift, use code <strong>WELCOME15</strong> to get 15% off your first order!</p>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" class="button">Start Shopping</a>
              </p>

              <p>Happy shopping!</p>
              <p>The Shaikh Jee Cosmetics Team</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send contact form email
export const sendContactFormEmail = async ({ name, email, subject, message, inquiryType }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const supportEmail = process.env.SUPPORT_EMAIL || EMAIL_USER;

  // Email to support team
  const supportMailOptions = {
    from: `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`,
    to: supportEmail,
    replyTo: email,
    subject: `[Contact Form] ${inquiryType || 'General'}: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #D4AF87; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; }
            .message-box { background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #D4AF87; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">From:</span> ${name}
              </div>
              <div class="field">
                <span class="label">Email:</span> ${email}
              </div>
              <div class="field">
                <span class="label">Inquiry Type:</span> ${inquiryType || 'General Assistance'}
              </div>
              <div class="field">
                <span class="label">Subject:</span> ${subject}
              </div>
              <div class="message-box">
                <span class="label">Message:</span>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">
                Submitted on: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  // Auto-reply to customer
  const autoReplyOptions = {
    from: `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`,
    to: email,
    subject: 'We received your message - Shaikh Jee Cosmetics',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4AF87, #C5A078); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting Us!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>

              <p>Thank you for reaching out to Shaikh Jee Cosmetics. We have received your message and our team will get back to you within 24-48 hours.</p>

              <p><strong>Here's a summary of your inquiry:</strong></p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong> ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</p>

              <p>In the meantime, you might find answers to common questions in our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/faq" style="color: #D4AF87;">FAQ section</a>.</p>

              <p>Best regards,<br/>The Shaikh Jee Cosmetics Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    // Send both emails
    await Promise.all([
      transporter.sendMail(supportMailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);
    console.log('Contact form emails sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Contact form email error:', error);
    return { success: false, error: error.message };
  }
};

// Send shipping update email
export const sendShippingUpdateEmail = async (order, trackingNumber, carrier) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track?order=${order.orderNumber}`;

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`,
    to: order.userEmail,
    subject: `Your Order #${order.orderNumber} Has Been Shipped!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4AF87, #C5A078); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .tracking-box { background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px dashed #D4AF87; }
            .button { display: inline-block; background: #D4AF87; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Order is On Its Way!</h1>
            </div>
            <div class="content">
              <p>Hi ${order.userName},</p>

              <p>Great news! Your order #${order.orderNumber} has been shipped and is on its way to you.</p>

              <div class="tracking-box">
                <p><strong>Tracking Number:</strong></p>
                <p style="font-size: 24px; color: #D4AF87; font-family: monospace;">${trackingNumber || 'Will be updated shortly'}</p>
                ${carrier ? `<p><strong>Carrier:</strong> ${carrier}</p>` : ''}
              </div>

              <p style="text-align: center;">
                <a href="${trackingUrl}" class="button">Track Your Order</a>
              </p>

              <p><strong>Delivery Address:</strong></p>
              <p>${order.shippingAddress.addressLine1}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>

              <p>Thank you for shopping with us!</p>
              <p>The Shaikh Jee Cosmetics Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Shipping update email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send order delivered email
export const sendOrderDeliveredEmail = async (order) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account?tab=orders`;

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`,
    to: order.userEmail,
    subject: `Your Order #${order.orderNumber} Has Been Delivered!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #D4AF87; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Delivered!</h1>
            </div>
            <div class="content">
              <p>Hi ${order.userName},</p>

              <p>Your order #${order.orderNumber} has been successfully delivered. We hope you love your purchase!</p>

              <p>We'd love to hear your feedback. Please take a moment to review your products:</p>

              <p style="text-align: center;">
                <a href="${reviewUrl}" class="button">Write a Review</a>
              </p>

              <p>If you have any questions or concerns about your order, please don't hesitate to contact us.</p>

              <p>Thank you for choosing Shaikh Jee Cosmetics!</p>
              <p>The Shaikh Jee Cosmetics Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order delivered email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
