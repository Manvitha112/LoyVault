// PDF Bill Generator for customer invoices
// Generates professional bills with shop details, GST, address, etc.

export const generateBillPDF = async (invoice, shopDetails) => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups to download bills.');
    }

    const billHTML = generateBillHTML(invoice, shopDetails);
    
    printWindow.document.write(billHTML);
    printWindow.document.close();
    
    // Wait for content to load
    printWindow.onload = () => {
      printWindow.print();
      // Close after printing or if user cancels
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };

    return true;
  } catch (error) {
    console.error('Failed to generate bill PDF:', error);
    throw error;
  }
};

const generateBillHTML = (invoice, shopDetails) => {
  const date = new Date(invoice.createdAt);
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate bill ID from transaction ID
  const billId = `BILL-${invoice.transactionId.slice(-8).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bill - ${billId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      padding: 20px;
      background: white;
      color: #000;
    }
    
    .bill-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 30px;
    }
    
    .bill-header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    
    .bill-title {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .shop-details {
      margin-bottom: 30px;
    }
    
    .shop-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .shop-info {
      font-size: 14px;
      line-height: 1.6;
    }
    
    .bill-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 15px;
      background: #f5f5f5;
      border: 1px solid #ddd;
    }
    
    .bill-info-section {
      flex: 1;
    }
    
    .bill-info-label {
      font-weight: bold;
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .bill-info-value {
      font-size: 14px;
      font-weight: bold;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table th {
      background: #000;
      color: #fff;
      padding: 12px;
      text-align: left;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
      font-size: 14px;
    }
    
    .items-table tr:last-child td {
      border-bottom: 2px solid #000;
    }
    
    .totals-section {
      margin-left: auto;
      width: 300px;
      margin-bottom: 30px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    
    .total-row.grand-total {
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 12px 0;
      margin-top: 10px;
      font-size: 18px;
      font-weight: bold;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
    
    .thank-you {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #000;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .bill-container {
        border: none;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="bill-container">
    <!-- Header -->
    <div class="bill-header">
      <div class="bill-title">TAX INVOICE</div>
    </div>
    
    <!-- Shop Details -->
    <div class="shop-details">
      <div class="shop-name">${shopDetails.shopName || invoice.shopName}</div>
      <div class="shop-info">
        ${shopDetails.address ? `<div><strong>Address:</strong> ${shopDetails.address}</div>` : ''}
        ${shopDetails.gstNumber ? `<div><strong>GSTIN:</strong> ${shopDetails.gstNumber}</div>` : ''}
        ${shopDetails.email ? `<div><strong>Email:</strong> ${shopDetails.email}</div>` : ''}
      </div>
    </div>
    
    <!-- Bill Info -->
    <div class="bill-info">
      <div class="bill-info-section">
        <div class="bill-info-label">BILL NO.</div>
        <div class="bill-info-value">${billId}</div>
      </div>
      <div class="bill-info-section">
        <div class="bill-info-label">DATE</div>
        <div class="bill-info-value">${formattedDate}</div>
      </div>
      <div class="bill-info-section">
        <div class="bill-info-label">TIME</div>
        <div class="bill-info-value">${formattedTime}</div>
      </div>
    </div>
    
    <!-- Customer Info (if available) -->
    ${invoice.customerName ? `
    <div style="margin-bottom: 20px; padding: 10px; background: #f9f9f9; border: 1px solid #ddd;">
      <div style="font-weight: bold; margin-bottom: 5px;">CUSTOMER DETAILS</div>
      <div style="font-size: 14px;">${invoice.customerName}</div>
      ${invoice.customerDID ? `<div style="font-size: 12px; color: #666;">DID: ${invoice.customerDID}</div>` : ''}
    </div>
    ` : ''}
    
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50px;">#</th>
          <th>DESCRIPTION</th>
          <th style="width: 80px; text-align: center;">QTY</th>
          <th style="width: 120px; text-align: right;">RATE</th>
          <th style="width: 120px; text-align: right;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${generateItemRows(invoice)}
      </tbody>
    </table>
    
    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₹${invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      ${invoice.tax > 0 ? `
      <div class="total-row">
        <span>GST/Tax:</span>
        <span>₹${invoice.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      ` : ''}
      ${invoice.discount > 0 ? `
      <div class="total-row">
        <span>Discount:</span>
        <span>-₹${invoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>GRAND TOTAL:</span>
        <span>₹${invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </div>
    
    <!-- Loyalty Points Info -->
    ${invoice.pointsAdded > 0 ? `
    <div style="padding: 15px; background: #e8f5e9; border: 1px solid #4caf50; margin-bottom: 20px; border-radius: 4px;">
      <div style="font-weight: bold; color: #2e7d32; margin-bottom: 5px;">LOYALTY REWARDS</div>
      <div style="font-size: 14px; color: #2e7d32;">
        <strong>+${invoice.pointsAdded} Points</strong> earned on this purchase
        ${invoice.tierAfter ? ` | Current Tier: <strong>${invoice.tierAfter}</strong>` : ''}
      </div>
    </div>
    ` : ''}
    
    <!-- Notes -->
    ${invoice.notes ? `
    <div style="margin-bottom: 20px; padding: 10px; background: #fff9e6; border: 1px solid #ffd54f;">
      <div style="font-weight: bold; margin-bottom: 5px;">NOTES</div>
      <div style="font-size: 13px;">${invoice.notes}</div>
    </div>
    ` : ''}
    
    <!-- Footer -->
    <div class="footer">
      <div class="thank-you">Thank you for your business!</div>
      <div>This is a computer-generated bill and does not require a signature.</div>
      <div style="margin-top: 10px;">Transaction ID: ${invoice.transactionId}</div>
    </div>
  </div>
</body>
</html>
  `;
};

const generateItemRows = (invoice) => {
  // If line items are available, use them
  if (invoice.lineItems && invoice.lineItems.length > 0) {
    return invoice.lineItems.map((item, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${item.name || item.description || 'Item'}</td>
        <td style="text-align: center;">${item.quantity || 1}</td>
        <td style="text-align: right;">₹${(item.price || item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">₹${(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');
  }
  
  // Otherwise, show a single line item for the total purchase
  return `
    <tr>
      <td style="text-align: center;">1</td>
      <td>Purchase Amount</td>
      <td style="text-align: center;">1</td>
      <td style="text-align: right;">₹${invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="text-align: right;">₹${invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
  `;
};
