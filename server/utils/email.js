import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
const EMAIL_FROM = process.env.EMAIL_FROM || `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`;

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

const formatCurrency = (value) => {
  if (typeof value !== 'number') value = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatOrderItemsHtml = (orderItems) => orderItems
  .map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

const formatAddressHtml = (address) => `
  <p style="margin: 0;">${address.name}</p>
  <p style="margin: 0;">${address.addressLine1}</p>
  ${address.addressLine2 ? `<p style="margin: 0;">${address.addressLine2}</p>` : ''}
  <p style="margin: 0;">${address.city}, ${address.state} ${address.pincode}</p>
  <p style="margin: 0;">Phone: ${address.phone}</p>
  <p style="margin: 0;">Email: ${address.email}</p>
`;

const buildHtmlTemplate = ({ title, heading, message, order, recipientName }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; background: #f7f7fb; }
        .wrapper { width: 100%; padding: 20px; }
        .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08); }
        .header { background: linear-gradient(135deg, #b08968, #f5c79a); padding: 28px 32px; color: #fff; text-align: center; }
        .content { padding: 32px; }
        .section { margin-bottom: 26px; }
        .section-title { margin-bottom: 12px; font-size: 18px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 12px 14px; border: 1px solid #e2e8f0; }
        th { background: #f8fafc; text-align: left; }
        .summary { padding: 18px; background: #f3f4f6; border-radius: 12px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .summary-row strong { color: #111827; }
        .footer { padding: 24px 32px 32px; font-size: 13px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>${heading}</h1>
          </div>
          <div class="content">
            <div class="section">
              <p>Hi ${recipientName || 'Team'},</p>
              <p>${message}</p>
            </div>

            <div class="section">
              <div class="section-title">Order Summary</div>
              <div class="summary">
                <div class="summary-row"><span>Order Number</span><strong>${order.orderNumber}</strong></div>
                <div class="summary-row"><span>Order Date</span><strong>${new Date(order.createdAt).toLocaleString()}</strong></div>
                <div class="summary-row"><span>Payment Method</span><strong>${order.paymentMethod}</strong></div>
                <div class="summary-row"><span>Total Price</span><strong>${formatCurrency(order.totalPrice)}</strong></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Customer Details</div>
              ${formatAddressHtml(order.shippingAddress)}
            </div>

            <div class="section">
              <div class="section-title">Products</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align:center;">Quantity</th>
                    <th style="text-align:right;">Unit Price</th>
                    <th style="text-align:right;">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${formatOrderItemsHtml(order.orderItems)}
                </tbody>
              </table>
            </div>
          </div>
          <div class="footer">
            <p>This email was generated automatically by Shaikh Jee Cosmetics.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
`;

export const sendOrderEmail = async (order) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: `New Order Received • ${order.orderNumber}`,
    html: buildHtmlTemplate({
      title: `New Order Received • ${order.orderNumber}`,
      heading: 'New Order Notification',
      recipientName: 'Admin',
      message: `A new order has been placed. Please review the details below and process it.`,
      order
    })
  };

  await transporter.sendMail(mailOptions);
};

export const sendCustomerOrderConfirmationEmail = async (order) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM,
    to: order.shippingAddress.email,
    subject: `Order Confirmation • ${order.orderNumber}`,
    html: buildHtmlTemplate({
      title: `Order Confirmation • ${order.orderNumber}`,
      heading: 'Order Confirmed',
      recipientName: order.shippingAddress.name,
      message: `Thank you for your purchase! We have received your order and will process it shortly. Here are the details of your order:`,
      order
    })
  };

  await transporter.sendMail(mailOptions);
};

// Send order status update email to customer
export const sendOrderStatusUpdateEmail = async (order, newStatus) => {
  const transporter = createTransporter();

  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    processing: 'Your order is now being processed.',
    shipped: 'Great news! Your order has been shipped and is on its way.',
    out_for_delivery: 'Your order is out for delivery. It will arrive soon!',
    delivered: 'Your order has been delivered successfully. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
  };

  const statusEmojis = {
    confirmed: '✅',
    processing: '⚙️',
    shipped: '📦',
    out_for_delivery: '🚚',
    delivered: '🎉',
    cancelled: '❌',
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;
  const emoji = statusEmojis[newStatus] || '📋';

  const mailOptions = {
    from: EMAIL_FROM,
    to: order.shippingAddress.email,
    subject: `${emoji} Order Update • ${order.orderNumber} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html: buildStatusUpdateTemplate({
      title: `Order Status Update • ${order.orderNumber}`,
      heading: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      recipientName: order.shippingAddress.name,
      message,
      order,
      newStatus
    })
  };

  await transporter.sendMail(mailOptions);
};

// Build status update email template
const buildStatusUpdateTemplate = ({ title, heading, message, order, recipientName, newStatus }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; background: #f7f7fb; }
        .wrapper { width: 100%; padding: 20px; }
        .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08); }
        .header { background: linear-gradient(135deg, #b08968, #f5c79a); padding: 28px 32px; color: #fff; text-align: center; }
        .content { padding: 32px; }
        .status-badge { display: inline-block; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; margin: 20px 0; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-processing { background: #fef3c7; color: #92400e; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .status-default { background: #e5e7eb; color: #374151; }
        .section { margin-bottom: 26px; }
        .section-title { margin-bottom: 12px; font-size: 18px; font-weight: 700; }
        .summary { padding: 18px; background: #f3f4f6; border-radius: 12px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .footer { padding: 24px 32px 32px; font-size: 13px; color: #6b7280; text-align: center; }
        .track-btn { display: inline-block; padding: 14px 32px; background: #b08968; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>${heading}</h1>
          </div>
          <div class="content">
            <div class="section">
              <p>Hi ${recipientName || 'Valued Customer'},</p>
              <p>${message}</p>
              <div class="status-badge status-${newStatus === 'delivered' ? 'delivered' : newStatus === 'shipped' || newStatus === 'out_for_delivery' ? 'shipped' : newStatus === 'processing' || newStatus === 'confirmed' ? 'processing' : newStatus === 'cancelled' ? 'cancelled' : 'default'}">
                Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Order Details</div>
              <div class="summary">
                <div class="summary-row"><span>Order Number</span><strong>${order.orderNumber || order._id}</strong></div>
                <div class="summary-row"><span>Order Date</span><strong>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                <div class="summary-row"><span>Total Amount</span><strong>${formatCurrency(order.totalPrice)}</strong></div>
                ${newStatus === 'delivered' && order.deliveredAt ? `<div class="summary-row"><span>Delivered On</span><strong>${new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>` : ''}
              </div>
            </div>

            ${newStatus === 'delivered' ? `
            <div class="section" style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 12px;">
              <p style="font-size: 18px; margin: 0;">🎁 Thank you for shopping with us!</p>
              <p style="color: #6b7280; margin-top: 8px;">We hope you love your purchase. If you have any questions, feel free to contact us.</p>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>This email was sent by Shaikh Jee Cosmetics regarding your order.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
`;
