const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #374151;
    background-color: #F3F4F6;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  .header {
    padding: 32px;
    text-align: center;
  }
  .logo {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: bold;
    color: white;
  }
  .company-name {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  .content {
    padding: 0 32px 32px;
  }
  .greeting {
    font-size: 18px;
    color: #111827;
    margin-bottom: 16px;
  }
  .quote-box {
    background: #F9FAFB;
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
    border: 1px solid #E5E7EB;
    text-align: center;
  }
  .quote-label {
    font-size: 14px;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .quote-amount {
    font-size: 36px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  .quote-service {
    font-size: 16px;
    color: #6B7280;
    margin-top: 8px;
  }
  .message-box {
    background: #EEF2FF;
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
    border-left: 4px solid;
  }
  .contact-section {
    background: #F9FAFB;
    padding: 24px 32px;
    text-align: center;
  }
  .contact-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 12px;
  }
  .footer {
    padding: 24px 32px;
    text-align: center;
    font-size: 12px;
    color: #9CA3AF;
  }
`;

export interface QuoteEmailData {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  ownerName: string;
  companyColor: string;
  companyLogoUrl?: string;
  customerName: string;
  customerFirstName: string;
  customerEmail: string;
  quoteAmount: number;
  serviceType: string;
  description?: string;
  personalMessage?: string;
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function getQuoteEmailHtml(data: QuoteEmailData): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.quoteAmount / 100);

  const logoInitial = data.businessName.charAt(0).toUpperCase();
  const brandColor = data.companyColor || '#4F46E5';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Quote from ${data.businessName}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <!-- Header -->
      <div class="header">
        ${data.companyLogoUrl 
          ? `<img src="${data.companyLogoUrl}" alt="${data.businessName}" style="width: 64px; height: 64px; border-radius: 12px; margin: 0 auto 16px; display: block; object-fit: cover;">`
          : `<div class="logo" style="background: ${brandColor};">${logoInitial}</div>`
        }
        <h1 class="company-name">${data.businessName}</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p class="greeting">Hi ${data.customerFirstName},</p>
        
        <p style="color: #4B5563;">Thank you for your interest in our services! Here's the quote you requested:</p>

        <!-- Quote Box -->
        <div class="quote-box">
          <p class="quote-label">Your Quote</p>
          <p class="quote-amount">${formattedAmount}</p>
          <p class="quote-service">${data.serviceType}</p>
        </div>

        ${data.description ? `
        <div style="margin: 24px 0;">
          <p style="font-weight: 600; color: #374151; margin-bottom: 8px;">Details:</p>
          <p style="color: #4B5563;">${data.description}</p>
        </div>
        ` : ''}

        ${data.personalMessage ? `
        <div class="message-box" style="border-left-color: ${brandColor};">
          <p style="margin: 0; color: #374151; font-style: italic;">"${data.personalMessage}"</p>
          <p style="margin: 12px 0 0; font-weight: 600; color: #374151;">— ${data.ownerName}</p>
        </div>
        ` : ''}

        <p style="color: #4B5563;">If you have any questions or would like to move forward, simply reply to this email or give us a call. We'd love to help!</p>
      </div>

      <!-- Contact Section -->
      <div class="contact-section">
        <p class="contact-title">Questions? We're here to help!</p>
        <p style="margin: 0; color: #4B5563;">
          📞 <a href="tel:${data.businessPhone}" style="color: #4B5563; text-decoration: none;">${formatPhoneDisplay(data.businessPhone)}</a>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          ✉️ <a href="mailto:${data.businessEmail}" style="color: #4B5563; text-decoration: none;">${data.businessEmail}</a>
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>This quote was sent by ${data.businessName}</p>
        <p style="margin-top: 8px;">Powered by Selestial</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function getQuoteEmailText(data: QuoteEmailData): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.quoteAmount / 100);

  return `
Hi ${data.customerFirstName},

Thank you for your interest in ${data.businessName}! Here's the quote you requested:

SERVICE: ${data.serviceType}
AMOUNT: ${formattedAmount}
${data.description ? `\nDETAILS: ${data.description}` : ''}
${data.personalMessage ? `\nMESSAGE FROM ${data.ownerName.toUpperCase()}:\n"${data.personalMessage}"` : ''}

If you have any questions or would like to move forward, simply reply to this email or give us a call.

CONTACT US:
Phone: ${formatPhoneDisplay(data.businessPhone)}
Email: ${data.businessEmail}

Thank you for considering ${data.businessName}!

Best regards,
${data.ownerName}
${data.businessName}

---
Powered by Selestial
  `.trim();
}
