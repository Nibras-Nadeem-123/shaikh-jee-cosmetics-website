import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
const EMAIL_FROM = process.env.EMAIL_FROM || `"Shaikh Jee Cosmetics" <${EMAIL_USER}>`;

const createTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email configuration is missing. Set EMAIL_USER and EMAIL_PASS in environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

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
