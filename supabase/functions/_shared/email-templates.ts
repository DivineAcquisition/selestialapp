const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; margin-bottom: 32px; }
  .logo { width: 48px; height: 48px; background: #4F46E5; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; }
  .brand { font-size: 24px; font-weight: bold; color: #111827; margin-top: 12px; }
  .content { background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E5E7EB; }
  .button { display: inline-block; background: #4F46E5; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
  .button:hover { background: #4338CA; }
  .footer { text-align: center; margin-top: 32px; color: #6B7280; font-size: 14px; }
  .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
  .stat-card { background: #F9FAFB; border-radius: 8px; padding: 16px; text-align: center; }
  .stat-value { font-size: 24px; font-weight: bold; color: #111827; }
  .stat-label { font-size: 12px; color: #6B7280; text-transform: uppercase; }
  .success { color: #059669; }
  .muted { color: #6B7280; font-size: 14px; }
  h1 { color: #111827; font-size: 24px; margin-bottom: 16px; }
  p { margin: 16px 0; }
  ol { margin: 16px 0; padding-left: 20px; }
  li { margin: 8px 0; }
`;

export function getVerificationEmailHtml(data: { verificationUrl: string; userName?: string }): string {
  const greeting = data.userName ? `Hi ${data.userName},` : 'Hi there,';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - Selestial</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">S</div>
      <div class="brand">Selestial</div>
    </div>
    
    <div class="content">
      <h1>Verify your email address</h1>
      
      <p>${greeting}</p>
      
      <p>Thanks for signing up for Selestial! Please verify your email address to get started.</p>
      
      <div style="text-align: center;">
        <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p class="muted">This link will expire in 24 hours. If you didn't create an account with Selestial, you can safely ignore this email.</p>
      
      <p class="muted">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #6B7280;">${data.verificationUrl}</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Selestial. All rights reserved.</p>
      <p>Automated quote follow-up for home service businesses.</p>
    </div>
  </div>
</body>
</html>`;
}

export function getPasswordResetEmailHtml(data: { resetUrl: string; userName?: string }): string {
  const greeting = data.userName ? `Hi ${data.userName},` : 'Hi there,';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password - Selestial</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">S</div>
      <div class="brand">Selestial</div>
    </div>
    
    <div class="content">
      <h1>Reset your password</h1>
      
      <p>${greeting}</p>
      
      <p>We received a request to reset your password. Click the button below to create a new password.</p>
      
      <div style="text-align: center;">
        <a href="${data.resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p class="muted">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      
      <p class="muted">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #6B7280;">${data.resetUrl}</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Selestial. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function getWelcomeEmailHtml(data: { userName: string; businessName: string; loginUrl: string }): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Selestial</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">S</div>
      <div class="brand">Selestial</div>
    </div>
    
    <div class="content">
      <h1>Welcome to Selestial! 🎉</h1>
      
      <p>Hi ${data.userName},</p>
      
      <p>Congratulations! <strong>${data.businessName}</strong> is all set up and ready to start winning more jobs with automated follow-up.</p>
      
      <p><strong>Here's what to do next:</strong></p>
      
      <ol>
        <li><strong>Add your first quote</strong> — Enter a recent quote you've given to a customer</li>
        <li><strong>Watch the magic happen</strong> — We'll automatically follow up on your behalf</li>
        <li><strong>Win more jobs</strong> — Mark quotes as won when they convert</li>
      </ol>
      
      <div style="text-align: center;">
        <a href="${data.loginUrl}" class="button">Go to Dashboard</a>
      </div>
      
      <div style="background: #F0FDF4; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0; color: #166534;">💡 <strong>Pro Tip:</strong> Most businesses see their first won quote from follow-up within the first week!</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Questions? Just reply to this email — we're here to help!</p>
      <p>&copy; ${new Date().getFullYear()} Selestial. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function getQuoteWonEmailHtml(data: { 
  userName: string; 
  customerName: string; 
  quoteAmount: string; 
  serviceType: string;
  dashboardUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Won - Selestial</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">S</div>
      <div class="brand">Selestial</div>
    </div>
    
    <div class="content">
      <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">🎉</div>
      
      <h1 style="text-align: center;">Quote Won!</h1>
      
      <p>Great news, ${data.userName}!</p>
      
      <p>Your quote for <strong>${data.customerName}</strong> has been marked as won.</p>
      
      <div style="background: #F0FDF4; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0; text-transform: uppercase;">Job Value</p>
        <p style="font-size: 32px; font-weight: bold; color: #166534; margin: 0;">${data.quoteAmount}</p>
        <p style="color: #6B7280; margin: 8px 0 0 0;">${data.serviceType}</p>
      </div>
      
      <p>This is what consistent follow-up looks like. Keep it up! 💪</p>
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">View Dashboard</a>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Selestial. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function getDailyDigestEmailHtml(data: {
  userName: string;
  stats: {
    newQuotes: number;
    messagesSent: number;
    quotesWon: number;
    quotesLost: number;
    revenueWon: string;
  };
  dashboardUrl: string;
}): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Digest - Selestial</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">S</div>
      <div class="brand">Selestial</div>
    </div>
    
    <div class="content">
      <h1>Daily Digest</h1>
      <p class="muted">${today}</p>
      
      <p>Hi ${data.userName}, here's your daily summary:</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.stats.newQuotes}</div>
          <div class="stat-label">New Quotes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.stats.messagesSent}</div>
          <div class="stat-label">Messages Sent</div>
        </div>
        <div class="stat-card">
          <div class="stat-value success">${data.stats.quotesWon}</div>
          <div class="stat-label">Quotes Won</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.stats.quotesLost}</div>
          <div class="stat-label">Quotes Lost</div>
        </div>
      </div>
      
      ${data.stats.quotesWon > 0 ? `
      <div style="background: #F0FDF4; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
        <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0; text-transform: uppercase;">Revenue Won Today</p>
        <p style="font-size: 24px; font-weight: bold; color: #166534; margin: 0;">${data.stats.revenueWon}</p>
      </div>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">View Full Dashboard</a>
      </div>
    </div>
    
    <div class="footer">
      <p>You're receiving this because you have daily digest enabled.</p>
      <p><a href="${data.dashboardUrl}/settings" style="color: #6B7280;">Manage notification preferences</a></p>
      <p>&copy; ${new Date().getFullYear()} Selestial. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// Plain text versions
export function getVerificationEmailText(data: { verificationUrl: string; userName?: string }): string {
  const greeting = data.userName ? `Hi ${data.userName},` : 'Hi there,';
  return `
${greeting}

Thanks for signing up for Selestial! Please verify your email address by clicking the link below:

${data.verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with Selestial, you can safely ignore this email.

---
Selestial - Automated quote follow-up for home service businesses
  `.trim();
}

export function getPasswordResetEmailText(data: { resetUrl: string; userName?: string }): string {
  const greeting = data.userName ? `Hi ${data.userName},` : 'Hi there,';
  return `
${greeting}

We received a request to reset your password. Click the link below to create a new password:

${data.resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

---
Selestial
  `.trim();
}

export function getCustomerReplyEmailHtml(data: { 
  userName: string; 
  customerName: string; 
  customerPhone: string;
  message: string;
  dashboardUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Replied - Selestial</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">S</div>
      <div class="brand">Selestial</div>
    </div>
    
    <div class="content">
      <h1>📱 Customer Replied!</h1>
      
      <p>Hi ${data.userName},</p>
      
      <p><strong>${data.customerName}</strong> (${data.customerPhone}) just replied to your follow-up message:</p>
      
      <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #4F46E5;">
        <p style="margin: 0; font-style: italic;">"${data.message}"</p>
      </div>
      
      <p>The automated sequence has been paused. You can resume it or mark the quote as won/lost from your dashboard.</p>
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">View in Dashboard</a>
      </div>
      
      <p class="muted">Tip: Respond quickly to increase your chances of winning the job!</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Selestial. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function getCustomerReplyEmailText(data: { 
  userName: string; 
  customerName: string; 
  customerPhone: string;
  message: string;
  dashboardUrl: string;
}): string {
  return `
Hi ${data.userName},

${data.customerName} (${data.customerPhone}) just replied to your follow-up message:

"${data.message}"

The automated sequence has been paused. You can resume it or mark the quote as won/lost from your dashboard.

View in Dashboard: ${data.dashboardUrl}

Tip: Respond quickly to increase your chances of winning the job!

---
Selestial
  `.trim();
}
