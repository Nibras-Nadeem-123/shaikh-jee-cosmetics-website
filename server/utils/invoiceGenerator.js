import PDFDocument from 'pdfkit';

/**
 * Generate PDF invoice for an order
 * @param {Object} order - The order object
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Colors
      const primaryColor = '#D4AF87';
      const textColor = '#333333';
      const lightGray = '#666666';

      // Header
      doc.fontSize(24)
        .fillColor(primaryColor)
        .text('SHAIKH JEE COSMETICS', 50, 50);

      doc.fontSize(10)
        .fillColor(lightGray)
        .text('Premium Beauty & Skincare', 50, 80);

      // Invoice Title
      doc.fontSize(20)
        .fillColor(textColor)
        .text('INVOICE', 400, 50, { align: 'right' });

      // Invoice Details
      doc.fontSize(10)
        .fillColor(lightGray)
        .text(`Invoice #: INV-${order.orderNumber || order._id}`, 400, 80, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 95, { align: 'right' })
        .text(`Status: ${order.status?.toUpperCase() || 'PENDING'}`, 400, 110, { align: 'right' });

      // Horizontal Line
      doc.strokeColor('#E5E5E5')
        .lineWidth(1)
        .moveTo(50, 140)
        .lineTo(550, 140)
        .stroke();

      // Bill To Section
      doc.fontSize(12)
        .fillColor(primaryColor)
        .text('BILL TO:', 50, 160);

      const customerName = order.shippingAddress?.name || order.userName || 'Customer';
      const address = order.shippingAddress;

      doc.fontSize(10)
        .fillColor(textColor)
        .text(customerName, 50, 180)
        .fillColor(lightGray);

      if (address) {
        doc.text(address.addressLine1 || '', 50, 195);
        if (address.addressLine2) {
          doc.text(address.addressLine2, 50, 210);
        }
        doc.text(`${address.city || ''}, ${address.state || ''} ${address.pincode || ''}`, 50, address.addressLine2 ? 225 : 210);
        if (address.phone) {
          doc.text(`Phone: ${address.phone}`, 50, address.addressLine2 ? 240 : 225);
        }
      }

      // Payment Info
      doc.fontSize(12)
        .fillColor(primaryColor)
        .text('PAYMENT INFO:', 350, 160);

      doc.fontSize(10)
        .fillColor(textColor)
        .text(`Method: ${order.paymentMethod || 'N/A'}`, 350, 180)
        .fillColor(lightGray)
        .text(`Payment ID: ${order.paymentInfo?.id || 'N/A'}`, 350, 195);

      // Items Table Header
      const tableTop = 290;
      doc.fontSize(10)
        .fillColor(primaryColor);

      // Table Header Background
      doc.rect(50, tableTop - 5, 500, 25)
        .fill('#F5F5F5');

      doc.fillColor(textColor)
        .text('ITEM', 60, tableTop, { width: 220 })
        .text('QTY', 290, tableTop, { width: 50, align: 'center' })
        .text('PRICE', 350, tableTop, { width: 80, align: 'right' })
        .text('TOTAL', 450, tableTop, { width: 90, align: 'right' });

      // Table Items
      let yPosition = tableTop + 30;

      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item, index) => {
          const itemName = item.name || item.product?.name || 'Product';
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const total = price * quantity;

          // Alternate row background
          if (index % 2 === 0) {
            doc.rect(50, yPosition - 5, 500, 25)
              .fill('#FAFAFA');
          }

          doc.fillColor(textColor)
            .text(itemName, 60, yPosition, { width: 220 })
            .text(quantity.toString(), 290, yPosition, { width: 50, align: 'center' })
            .text(`Rs.${price.toFixed(2)}`, 350, yPosition, { width: 80, align: 'right' })
            .text(`Rs.${total.toFixed(2)}`, 450, yPosition, { width: 90, align: 'right' });

          // Add shade info if available
          if (item.selectedShade) {
            yPosition += 15;
            doc.fontSize(8)
              .fillColor(lightGray)
              .text(`Shade: ${item.selectedShade.name || item.selectedShade}`, 60, yPosition);
            yPosition += 5;
          }

          yPosition += 25;
        });
      }

      // Horizontal Line before totals
      doc.strokeColor('#E5E5E5')
        .lineWidth(1)
        .moveTo(50, yPosition + 10)
        .lineTo(550, yPosition + 10)
        .stroke();

      yPosition += 30;

      // Totals Section
      const totalsX = 380;

      doc.fontSize(10)
        .fillColor(lightGray)
        .text('Subtotal:', totalsX, yPosition)
        .fillColor(textColor)
        .text(`Rs.${(order.itemsPrice || 0).toFixed(2)}`, 480, yPosition, { align: 'right' });

      yPosition += 20;

      doc.fillColor(lightGray)
        .text('Shipping:', totalsX, yPosition)
        .fillColor(textColor)
        .text(`Rs.${(order.shippingPrice || 0).toFixed(2)}`, 480, yPosition, { align: 'right' });

      if (order.discount && order.discount.amount > 0) {
        yPosition += 20;
        doc.fillColor(lightGray)
          .text('Discount:', totalsX, yPosition)
          .fillColor('#22C55E')
          .text(`-Rs.${order.discount.amount.toFixed(2)}`, 480, yPosition, { align: 'right' });
      }

      yPosition += 25;

      // Total Amount
      doc.rect(totalsX - 10, yPosition - 5, 180, 30)
        .fill(primaryColor);

      doc.fontSize(12)
        .fillColor('#FFFFFF')
        .text('TOTAL:', totalsX, yPosition + 3)
        .fontSize(14)
        .text(`Rs.${(order.totalPrice || 0).toFixed(2)}`, 480, yPosition + 1, { align: 'right' });

      // Footer
      const footerY = 750;

      doc.fontSize(9)
        .fillColor(lightGray)
        .text('Thank you for shopping with Shaikh Jee Cosmetics!', 50, footerY, { align: 'center', width: 500 })
        .text('For queries, contact us at support@shaikhjee.com', 50, footerY + 15, { align: 'center', width: 500 });

      // Terms
      doc.fontSize(8)
        .text('Terms: All products are authentic and come with manufacturer warranty.', 50, footerY + 35, { align: 'center', width: 500 })
        .text('Returns accepted within 7 days of delivery in original packaging.', 50, footerY + 47, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate invoice filename
 * @param {Object} order - The order object
 * @returns {string} - Filename
 */
export const getInvoiceFilename = (order) => {
  const orderNum = order.orderNumber || order._id;
  const date = new Date(order.createdAt).toISOString().split('T')[0];
  return `Invoice-${orderNum}-${date}.pdf`;
};

export default {
  generateInvoicePDF,
  getInvoiceFilename
};
