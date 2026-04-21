import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email configuration is missing. Set SMTP_USER and SMTP_PASS in environment variables.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // important for port 587
    requireTLS: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    connectionTimeout: 10000, // avoid long timeout
  });
};

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY ✅");
  }
})

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${process.env.SMTP_USER}>`,
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
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${process.env.SMTP_USER}>`,
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
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Shaikh Jee Cosmetics" <${process.env.SMTP_USER}>`,
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
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
