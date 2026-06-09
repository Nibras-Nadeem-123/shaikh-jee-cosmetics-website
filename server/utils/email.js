// import nodemailer from 'nodemailer';

// const EMAIL_USER = process.env.SMTP_USER;
// const EMAIL_PASS = process.env.SMTP_PASS;
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
// const EMAIL_FROM = `"Shaikh Jee Cosmetics" <nibrasnadeem621@gmail.com>`;

// const createTransporter = () => {
//   if (!EMAIL_USER || !EMAIL_PASS) {
//     throw new Error('Email configuration is missing. Set SMTP_USER and SMTP_PASS in environment variables.');
//   }

//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
//     port: Number(process.env.SMTP_PORT) || 2525,
//     secure: false, // important for port 587
//     requireTLS: true,
//     auth: {
//       user: EMAIL_USER,
//       pass: EMAIL_PASS,
//     },
//     connectionTimeout: 10000, // avoid long timeout
//   });

//   return transporter;
// };

// // ✅ Optional but VERY useful (debug connection)
// export const verifySMTP = async () => {
//   try {
//     const transporter = createTransporter();
//     await transporter.verify();
//     console.log("✅ SMTP is ready");
//   } catch (err) {
//     console.error("❌ SMTP ERROR:", err);
//   }
// };


// const formatCurrency = (value) => {
//   if (typeof value !== 'number') value = Number(value) || 0;
//   return new Intl.NumberFormat('en-PK', {
//     style: 'currency',
//     currency: 'PKR',
//     maximumFractionDigits: 2,
//   }).format(value);
// };

// const formatOrderItemsHtml = (orderItems) => orderItems
//   .map(item => `
//     <tr>
//       <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.name}</td>
//       <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
//       <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price)}</td>
//       <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
//     </tr>
//   `).join('');

// const formatAddressHtml = (address) => `
//   <p style="margin: 0;">${address.name}</p>
//   <p style="margin: 0;">${address.addressLine1}</p>
//   ${address.addressLine2 ? `<p style="margin: 0;">${address.addressLine2}</p>` : ''}
//   <p style="margin: 0;">${address.city}, ${address.state} ${address.pincode}</p>
//   <p style="margin: 0;">Phone: ${address.phone}</p>
//   <p style="margin: 0;">Email: ${address.email}</p>
// `;

// const buildHtmlTemplate = ({ title, heading, message, order, recipientName }) => `
//   <!DOCTYPE html>
//   <html>
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <title>${title}</title>
//       <style>
//         body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; background: #f7f7fb; }
//         .wrapper { width: 100%; padding: 20px; }
//         .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08); }
//         .header { background: linear-gradient(135deg, #b08968, #f5c79a); padding: 28px 32px; color: #fff; text-align: center; }
//         .content { padding: 32px; }
//         .section { margin-bottom: 26px; }
//         .section-title { margin-bottom: 12px; font-size: 18px; font-weight: 700; }
//         table { width: 100%; border-collapse: collapse; margin-top: 16px; }
//         th, td { padding: 12px 14px; border: 1px solid #e2e8f0; }
//         th { background: #f8fafc; text-align: left; }
//         .summary { padding: 18px; background: #f3f4f6; border-radius: 12px; }
//         .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
//         .summary-row strong { color: #111827; }
//         .footer { padding: 24px 32px 32px; font-size: 13px; color: #6b7280; text-align: center; }
//       </style>
//     </head>
//     <body>
//       <div class="wrapper">
//         <div class="container">
//           <div class="header">
//             <h1>${heading}</h1>
//           </div>
//           <div class="content">
//             <div class="section">
//               <p>Hi ${recipientName || 'Team'},</p>
//               <p>${message}</p>
//             </div>

//             <div class="section">
//               <div class="section-title">Order Summary</div>
//               <div class="summary">
//                 <div class="summary-row"><span>Order Number</span><strong>${order.orderNumber}</strong></div>
//                 <div class="summary-row"><span>Order Date</span><strong>${new Date(order.createdAt).toLocaleString()}</strong></div>
//                 <div class="summary-row"><span>Payment Method</span><strong>${order.paymentMethod}</strong></div>
//                 <div class="summary-row"><span>Total Price</span><strong>${formatCurrency(order.totalPrice)}</strong></div>
//               </div>
//             </div>

//             <div class="section">
//               <div class="section-title">Customer Details</div>
//               ${formatAddressHtml(order.shippingAddress)}
//             </div>

//             <div class="section">
//               <div class="section-title">Products</div>
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th style="text-align:center;">Quantity</th>
//                     <th style="text-align:right;">Unit Price</th>
//                     <th style="text-align:right;">Line Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${formatOrderItemsHtml(order.orderItems)}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div class="footer">
//             <p>This email was generated automatically by Shaikh Jee Cosmetics.</p>
//           </div>
//         </div>
//       </div>
//     </body>
//   </html>
// `;

// export const sendOrderEmail = async (order) => {
//   try {
//     const transporter = createTransporter();
//     const mailOptions = {
//       from: EMAIL_FROM,
//       to: ADMIN_EMAIL,
//       subject: `New Order Received • ${order.orderNumber}`,
//       html: buildHtmlTemplate({
//         title: `New Order Received • ${order.orderNumber}`,
//         heading: 'New Order Notification',
//         recipientName: 'Admin',
//         message: `A new order has been placed. Please review the details below and process it.`,
//         order
//       })
//     };
//     const info = await transporter.sendMail(mailOptions);
//     console.log("EMAIL SENT:", info);
//   } catch (err) {
//     console.error("EMAIL FAILED:", err);
//   }
//   // await transporter.sendMail(mailOptions);
// };

// export const sendCustomerOrderConfirmationEmail = async (order) => {
//   try {
//     const transporter = createTransporter();
//     const mailOptions = {
//       from: EMAIL_FROM,
//       to: order.shippingAddress.email,
//       subject: `Order Confirmation • ${order.orderNumber}`,
//       html: buildHtmlTemplate({
//         title: `Order Confirmation • ${order.orderNumber}`,
//         heading: 'Order Confirmed',
//         recipientName: order.shippingAddress.name,
//         message: `Thank you for your purchase! We have received your order and will process it shortly. Here are the details of your order:`,
//         order
//       })
//     };
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ CUSTOMER EMAIL SENT:", info.response);

//   } catch (err) {
//     console.error("❌ CUSTOMER EMAIL FAILED:", err);
//   }

//   // await transporter.sendMail(mailOptions);
// };

// // Send order status update email to customer
// export const sendOrderStatusUpdateEmail = async (order, newStatus) => {
//   try {
//     const transporter = createTransporter();

//     const statusMessages = {
//       confirmed: 'Your order has been confirmed and is being prepared.',
//       processing: 'Your order is now being processed.',
//       shipped: 'Great news! Your order has been shipped and is on its way.',
//       out_for_delivery: 'Your order is out for delivery. It will arrive soon!',
//       delivered: 'Your order has been delivered successfully. Thank you for shopping with us!',
//       cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
//     };

//     const statusEmojis = {
//       confirmed: '✅',
//       processing: '⚙️',
//       shipped: '📦',
//       out_for_delivery: '🚚',
//       delivered: '🎉',
//       cancelled: '❌',
//     };

//     const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;
//     const emoji = statusEmojis[newStatus] || '📋';

//     const mailOptions = {
//       from: EMAIL_FROM,
//       to: order.shippingAddress.email,
//       subject: `${emoji} Order Update • ${order.orderNumber} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
//       html: buildStatusUpdateTemplate({
//         title: `Order Status Update • ${order.orderNumber}`,
//         heading: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
//         recipientName: order.shippingAddress.name,
//         message,
//         order,
//         newStatus
//       })
//     };
//   const info = await transporter.sendMail(mailOptions);
//     console.log("✅ STATUS EMAIL SENT:", info.response);

//   } catch (err) {
//     console.error("❌ STATUS EMAIL FAILED:", err);
//   }

//   // await transporter.sendMail(mailOptions);
// };

// // Build status update email template
// const buildStatusUpdateTemplate = ({ title, heading, message, order, recipientName, newStatus }) => `
//   <!DOCTYPE html>
//   <html>
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <title>${title}</title>
//       <style>
//         body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; background: #f7f7fb; }
//         .wrapper { width: 100%; padding: 20px; }
//         .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08); }
//         .header { background: linear-gradient(135deg, #b08968, #f5c79a); padding: 28px 32px; color: #fff; text-align: center; }
//         .content { padding: 32px; }
//         .status-badge { display: inline-block; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; margin: 20px 0; }
//         .status-delivered { background: #d1fae5; color: #065f46; }
//         .status-shipped { background: #dbeafe; color: #1e40af; }
//         .status-processing { background: #fef3c7; color: #92400e; }
//         .status-cancelled { background: #fee2e2; color: #991b1b; }
//         .status-default { background: #e5e7eb; color: #374151; }
//         .section { margin-bottom: 26px; }
//         .section-title { margin-bottom: 12px; font-size: 18px; font-weight: 700; }
//         .summary { padding: 18px; background: #f3f4f6; border-radius: 12px; }
//         .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
//         .footer { padding: 24px 32px 32px; font-size: 13px; color: #6b7280; text-align: center; }
//         .track-btn { display: inline-block; padding: 14px 32px; background: #b08968; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
//       </style>
//     </head>
//     <body>
//       <div class="wrapper">
//         <div class="container">
//           <div class="header">
//             <h1>${heading}</h1>
//           </div>
//           <div class="content">
//             <div class="section">
//               <p>Hi ${recipientName || 'Valued Customer'},</p>
//               <p>${message}</p>
//               <div class="status-badge status-${newStatus === 'delivered' ? 'delivered' : newStatus === 'shipped' || newStatus === 'out_for_delivery' ? 'shipped' : newStatus === 'processing' || newStatus === 'confirmed' ? 'processing' : newStatus === 'cancelled' ? 'cancelled' : 'default'}">
//                 Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}
//               </div>
//             </div>

//             <div class="section">
//               <div class="section-title">Order Details</div>
//               <div class="summary">
//                 <div class="summary-row"><span>Order Number</span><strong>${order.orderNumber || order._id}</strong></div>
//                 <div class="summary-row"><span>Order Date</span><strong>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
//                 <div class="summary-row"><span>Total Amount</span><strong>${formatCurrency(order.totalPrice)}</strong></div>
//                 ${newStatus === 'delivered' && order.deliveredAt ? `<div class="summary-row"><span>Delivered On</span><strong>${new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>` : ''}
//               </div>
//             </div>

//             ${newStatus === 'delivered' ? `
//             <div class="section" style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 12px;">
//               <p style="font-size: 18px; margin: 0;">🎁 Thank you for shopping with us!</p>
//               <p style="color: #6b7280; margin-top: 8px;">We hope you love your purchase. If you have any questions, feel free to contact us.</p>
//             </div>
//             ` : ''}
//           </div>
//           <div class="footer">
//             <p>This email was sent by Shaikh Jee Cosmetics regarding your order.</p>
//             <p>If you have any questions, please contact our support team.</p>
//           </div>
//         </div>
//       </div>
//     </body>
//   </html>
// `;

import axios from "axios";

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const SENDER_EMAIL = "ovaissheikh84@gmail.com";
const SENDER_NAME = "Shaikh Jee Cosmetics";

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is missing in environment variables");
}

/**
 * Base send function (reusable)
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("EMAIL SENT SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("EMAIL FAILED:", error?.response?.data || error.message);
    throw error;
  }
};

/* =========================
   FORMAT HELPERS
========================= */

const formatCurrency = (value) => {
  value = typeof value === "number" ? value : Number(value) || 0;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(value);
};

const formatOrderItemsHtml = (items) =>
  items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px;border:1px solid #e2e8f0">${item.name}</td>
      <td style="text-align:center;padding:10px;border:1px solid #e2e8f0">${item.quantity}</td>
      <td style="text-align:right;padding:10px;border:1px solid #e2e8f0">${formatCurrency(
        item.price
      )}</td>
      <td style="text-align:right;padding:10px;border:1px solid #e2e8f0">${formatCurrency(
        item.price * item.quantity
      )}</td>
    </tr>
  `
    )
    .join("");

const formatAddressHtml = (a) => `
  <p style="margin:0">${a.name}</p>
  <p style="margin:0">${a.addressLine1}</p>
  ${a.addressLine2 ? `<p style="margin:0">${a.addressLine2}</p>` : ""}
  <p style="margin:0">${a.city}, ${a.state} ${a.pincode}</p>
  <p style="margin:0">📞 ${a.phone}</p>
  <p style="margin:0">📧 ${a.email}</p>
`;

/* =========================
   EMAIL TEMPLATE (ORDER)
========================= */

const buildOrderTemplate = ({ title, heading, message, order, recipientName }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
</head>
<body style="font-family:Arial;background:#f7f7fb;padding:20px">

  <div style="max-width:680px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">

    <div style="background:#b08968;color:#fff;padding:20px;text-align:center">
      <h2>${heading}</h2>
    </div>

    <div style="padding:20px">
      <p>Hi ${recipientName || "Customer"},</p>
      <p>${message}</p>

      <h3>Order Summary</h3>
      <p><b>Order:</b> ${order.orderNumber}</p>
      <p><b>Total:</b> ${formatCurrency(order.totalPrice)}</p>

      <h3>Shipping</h3>
      ${formatAddressHtml(order.shippingAddress)}

      <h3>Items</h3>
      <table width="100%" border="0" cellspacing="0">
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
        ${formatOrderItemsHtml(order.orderItems)}
      </table>
    </div>

  </div>
</body>
</html>
`;

/* =========================
   ADMIN ORDER EMAIL
========================= */

export const sendOrderEmail = async (order) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL || SENDER_EMAIL,
    subject: `New Order • ${order.orderNumber}`,
    html: buildOrderTemplate({
      title: "New Order",
      heading: "New Order Received",
      message: "A new order has been placed.",
      order,
      recipientName: "Admin",
    }),
  });
};

/* =========================
   CUSTOMER CONFIRMATION
========================= */

export const sendCustomerOrderConfirmationEmail = async (order) => {
  return sendEmail({
    to: order.shippingAddress.email,
    subject: `Order Confirmation • ${order.orderNumber}`,
    html: buildOrderTemplate({
      title: "Order Confirmed",
      heading: "Order Confirmed 🎉",
      message: "Thank you for your order!",
      order,
      recipientName: order.shippingAddress.name,
    }),
  });
};

/* =========================
   STATUS UPDATE EMAIL
========================= */

export const sendOrderStatusUpdateEmail = async (order, newStatus) => {
  const messages = {
    confirmed: "Your order is confirmed.",
    processing: "Your order is being processed.",
    shipped: "Your order has been shipped.",
    out_for_delivery: "Your order is out for delivery.",
    delivered: "Your order has been delivered.",
    cancelled: "Your order has been cancelled.",
  };

  const emoji = {
    confirmed: "✅",
    processing: "⚙️",
    shipped: "📦",
    out_for_delivery: "🚚",
    delivered: "🎉",
    cancelled: "❌",
  };

  return sendEmail({
    to: order.shippingAddress.email,
    subject: `${emoji[newStatus] || "📦"} Order Update • ${order.orderNumber}`,
    html: buildOrderTemplate({
      title: "Order Update",
      heading: `Order ${newStatus}`,
      message: messages[newStatus] || "Status updated",
      order,
      recipientName: order.shippingAddress.name,
    }),
  });
};

/* =========================
   ABANDONED CART EMAIL
========================= */

const getAbandonedCartSubject = (reminderNumber) => {
  switch (reminderNumber) {
    case 1:
      return "You left something behind! 🛒";
    case 2:
      return "Your cart misses you! 💝";
    case 3:
      return "Last chance! Your cart is expiring soon ⏰";
    default:
      return "Complete your purchase at Shaikh Jee Cosmetics";
  }
};

const getAbandonedCartIntro = (reminderNumber) => {
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

const getAbandonedCartOutro = (reminderNumber) => {
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

const buildAbandonedCartTemplate = ({ userName, items, cartTotal, recoveryUrl, reminderNumber }) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee">
        <img src="${item.product?.images?.[0] || item.product?.image || '/placeholder.png'}"
             alt="${item.product?.name || 'Product'}"
             style="width:60px;height:60px;object-fit:cover;border-radius:8px">
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee">
        <strong>${item.product?.name || 'Product'}</strong>
        ${item.shade ? `<br><small style="color:#666">Shade: ${item.shade.name}</small>` : ''}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency((item.product?.price || 0) * item.quantity)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Complete Your Purchase</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f7f7fb;padding:20px;margin:0">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#D4AF87,#E8C9A0);padding:30px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px">Shaikh Jee Cosmetics</h1>
    </div>

    <!-- Content -->
    <div style="padding:30px">
      <h2 style="color:#333;margin-top:0">Hi ${userName || 'there'},</h2>

      <p style="color:#555;font-size:16px;line-height:1.6">
        ${getAbandonedCartIntro(reminderNumber)}
      </p>

      <!-- Cart Items -->
      <table style="width:100%;border-collapse:collapse;margin:25px 0">
        <thead>
          <tr style="background:#f8f8f8">
            <th style="padding:12px;text-align:left;font-size:14px;color:#666">Product</th>
            <th style="padding:12px;text-align:left;font-size:14px;color:#666">Name</th>
            <th style="padding:12px;text-align:center;font-size:14px;color:#666">Qty</th>
            <th style="padding:12px;text-align:right;font-size:14px;color:#666">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:15px;text-align:right;font-weight:bold;font-size:16px">Total:</td>
            <td style="padding:15px;text-align:right;font-weight:bold;font-size:18px;color:#D4AF87">${formatCurrency(cartTotal)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- CTA Button -->
      <div style="text-align:center;margin:30px 0">
        <a href="${recoveryUrl}"
           style="display:inline-block;background:#D4AF87;color:#fff;padding:16px 40px;text-decoration:none;border-radius:50px;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(212,175,135,0.4)">
          Complete Your Purchase
        </a>
      </div>

      <p style="color:#888;font-size:14px;line-height:1.6">
        ${getAbandonedCartOutro(reminderNumber)}
      </p>

      <!-- Benefits -->
      <div style="background:#faf8f5;border-radius:12px;padding:20px;margin-top:25px">
        <p style="margin:0 0 10px;font-weight:bold;color:#333">Why shop with us?</p>
        <p style="margin:5px 0;color:#666;font-size:14px">✓ 100% Authentic Products</p>
        <p style="margin:5px 0;color:#666;font-size:14px">✓ Free Delivery Above Rs. 999</p>
        <p style="margin:5px 0;color:#666;font-size:14px">✓ Easy 7-Day Returns</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f8f8;padding:20px;text-align:center">
      <p style="color:#999;font-size:12px;margin:0">
        If you no longer wish to receive these emails, you can update your preferences in your account settings.
      </p>
      <p style="color:#999;font-size:12px;margin:10px 0 0">
        © ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

export const sendAbandonedCartEmail = async ({ to, userName, items, cartTotal, recoveryUrl, reminderNumber }) => {
  return sendEmail({
    to,
    subject: getAbandonedCartSubject(reminderNumber),
    html: buildAbandonedCartTemplate({
      userName,
      items,
      cartTotal,
      recoveryUrl,
      reminderNumber
    }),
  });
};

/* =========================
   LOW STOCK ALERT EMAIL (Admin)
========================= */

const buildLowStockAlertTemplate = ({ products, totalLowStock, criticalCount }) => {
  const adminUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const productRowsHtml = products.map(product => {
    const stockLevel = product.inventory?.quantity || product.quantity || 0;
    const threshold = product.inventory?.lowStockThreshold || 10;
    const isCritical = stockLevel <= Math.floor(threshold / 2);

    return `
      <tr style="background:${isCritical ? '#fef2f2' : '#fff'}">
        <td style="padding:12px;border-bottom:1px solid #eee">
          <div style="display:flex;align-items:center;gap:10px">
            <img src="${product.images?.[0] || product.image || '/placeholder.png'}"
                 alt="${product.name}"
                 style="width:50px;height:50px;object-fit:cover;border-radius:8px">
            <div>
              <strong style="color:#333">${product.name}</strong>
              <br>
              <small style="color:#666">SKU: ${product.sku || product._id}</small>
            </div>
          </div>
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">
          <span style="padding:4px 12px;border-radius:20px;font-weight:bold;font-size:14px;
                       background:${isCritical ? '#fee2e2' : '#fef3c7'};
                       color:${isCritical ? '#dc2626' : '#d97706'}">
            ${stockLevel}
          </span>
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;color:#666">
          ${threshold}
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">
          <span style="color:${isCritical ? '#dc2626' : '#d97706'};font-weight:bold">
            ${isCritical ? 'CRITICAL' : 'LOW'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Low Stock Alert</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f7f7fb;padding:20px;margin:0">
  <div style="max-width:700px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:30px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">Low Stock Alert</h1>
      <p style="color:#fecaca;margin:10px 0 0;font-size:14px">Shaikh Jee Cosmetics Inventory</p>
    </div>

    <!-- Summary -->
    <div style="padding:20px 30px;background:#fef2f2;border-bottom:1px solid #fecaca">
      <div style="display:flex;justify-content:space-around;text-align:center">
        <div>
          <p style="margin:0;font-size:32px;font-weight:bold;color:#dc2626">${totalLowStock}</p>
          <p style="margin:5px 0 0;color:#666;font-size:14px">Products Low</p>
        </div>
        <div style="border-left:1px solid #fecaca;padding-left:30px">
          <p style="margin:0;font-size:32px;font-weight:bold;color:#991b1b">${criticalCount}</p>
          <p style="margin:5px 0 0;color:#666;font-size:14px">Critical Stock</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div style="padding:30px">
      <h2 style="color:#333;margin-top:0;font-size:18px">Products Requiring Attention</h2>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#f8f8f8">
            <th style="padding:12px;text-align:left;font-size:14px;color:#666">Product</th>
            <th style="padding:12px;text-align:center;font-size:14px;color:#666">Current Stock</th>
            <th style="padding:12px;text-align:center;font-size:14px;color:#666">Threshold</th>
            <th style="padding:12px;text-align:center;font-size:14px;color:#666">Status</th>
          </tr>
        </thead>
        <tbody>
          ${productRowsHtml}
        </tbody>
      </table>

      <!-- CTA Button -->
      <div style="text-align:center;margin:30px 0">
        <a href="${adminUrl}/admin/products"
           style="display:inline-block;background:#D4AF87;color:#fff;padding:14px 32px;text-decoration:none;border-radius:50px;font-weight:bold;font-size:14px">
          Manage Inventory
        </a>
      </div>

      <!-- Tips -->
      <div style="background:#f8f8f8;border-radius:12px;padding:20px;margin-top:20px">
        <p style="margin:0 0 10px;font-weight:bold;color:#333;font-size:14px">Recommended Actions:</p>
        <p style="margin:5px 0;color:#666;font-size:13px">• Review and reorder critical stock items immediately</p>
        <p style="margin:5px 0;color:#666;font-size:13px">• Update product availability if items are discontinued</p>
        <p style="margin:5px 0;color:#666;font-size:13px">• Consider enabling backorders for popular items</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f8f8;padding:20px;text-align:center">
      <p style="color:#999;font-size:12px;margin:0">
        This is an automated inventory alert from Shaikh Jee Cosmetics.
      </p>
      <p style="color:#999;font-size:12px;margin:10px 0 0">
        © ${new Date().getFullYear()} Shaikh Jee Cosmetics. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

export const sendLowStockAlertEmail = async (products) => {
  const adminEmail = process.env.ADMIN_EMAIL || SENDER_EMAIL;

  // Calculate critical count (stock at or below half of threshold)
  const criticalCount = products.filter(p => {
    const stock = p.inventory?.quantity || p.quantity || 0;
    const threshold = p.inventory?.lowStockThreshold || 10;
    return stock <= Math.floor(threshold / 2);
  }).length;

  return sendEmail({
    to: adminEmail,
    subject: `⚠️ Low Stock Alert: ${products.length} Products Need Attention`,
    html: buildLowStockAlertTemplate({
      products,
      totalLowStock: products.length,
      criticalCount
    }),
  });
};

/* =========================
   SINGLE PRODUCT LOW STOCK ALERT
========================= */

export const sendSingleProductLowStockAlert = async (product) => {
  const adminEmail = process.env.ADMIN_EMAIL || SENDER_EMAIL;
  const adminUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const stockLevel = product.inventory?.quantity || product.quantity || 0;
  const threshold = product.inventory?.lowStockThreshold || 10;
  const isCritical = stockLevel <= Math.floor(threshold / 2);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Low Stock Alert</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f7f7fb;padding:20px;margin:0">
  <div style="max-width:500px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">

    <div style="background:${isCritical ? '#dc2626' : '#f59e0b'};padding:20px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:20px">
        ${isCritical ? '🚨 Critical Stock Alert' : '⚠️ Low Stock Alert'}
      </h1>
    </div>

    <div style="padding:25px;text-align:center">
      <img src="${product.images?.[0] || product.image || '/placeholder.png'}"
           alt="${product.name}"
           style="width:120px;height:120px;object-fit:cover;border-radius:12px;margin-bottom:15px">

      <h2 style="color:#333;margin:0 0 10px;font-size:18px">${product.name}</h2>
      <p style="color:#666;margin:0 0 20px;font-size:14px">SKU: ${product.sku || product._id}</p>

      <div style="background:${isCritical ? '#fef2f2' : '#fffbeb'};border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="margin:0;font-size:48px;font-weight:bold;color:${isCritical ? '#dc2626' : '#d97706'}">
          ${stockLevel}
        </p>
        <p style="margin:5px 0 0;color:#666;font-size:14px">units remaining (threshold: ${threshold})</p>
      </div>

      <a href="${adminUrl}/admin/products"
         style="display:inline-block;background:#D4AF87;color:#fff;padding:12px 28px;text-decoration:none;border-radius:50px;font-weight:bold;font-size:14px">
        Update Inventory
      </a>
    </div>

    <div style="background:#f8f8f8;padding:15px;text-align:center">
      <p style="color:#999;font-size:11px;margin:0">
        Automated alert from Shaikh Jee Cosmetics Inventory System
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `${isCritical ? '🚨 CRITICAL' : '⚠️ Low Stock'}: ${product.name} - Only ${stockLevel} left`,
    html
  });
};
