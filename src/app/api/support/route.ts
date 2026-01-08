import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Support ticket schema
interface SupportTicket {
  category: string;
  subject: string;
  description: string;
  priority: string;
}

// Category labels for display
const categoryLabels: Record<string, string> = {
  bug: '🐛 Bug Report',
  feature: '💡 Feature Request',
  billing: '💳 Billing & Payments',
  account: '⚙️ Account & Settings',
  integration: '✨ Integrations',
  other: '❓ General Question',
};

// Priority labels and colors
const priorityLabels: Record<string, string> = {
  low: '🟢 Low',
  normal: '🔵 Normal',
  high: '🟡 High',
  urgent: '🔴 Urgent',
};

// Send email via Resend
async function sendSupportEmail({
  ticket,
  user,
  business,
}: {
  ticket: SupportTicket;
  user: { id: string; email: string; name?: string };
  business?: { id: string; name: string; industry?: string };
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return false;
  }

  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Support Request</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">
          ${categoryLabels[ticket.category] || ticket.category}
        </p>
      </div>

      <!-- Priority Badge -->
      <div style="background: #f8f9fa; padding: 12px 24px; border-left: 1px solid #eee; border-right: 1px solid #eee;">
        <span style="font-size: 14px; color: #666;">
          Priority: <strong>${priorityLabels[ticket.priority] || ticket.priority}</strong>
        </span>
      </div>

      <!-- Content -->
      <div style="background: white; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
        
        <!-- Subject -->
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 8px; font-size: 18px;">${escapeHtml(ticket.subject)}</h2>
        </div>

        <!-- Description -->
        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(ticket.description)}</p>
        </div>

        <!-- User Info -->
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <h3 style="color: #666; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Submitted By
          </h3>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #666; width: 120px;">Name:</td>
              <td style="padding: 6px 0; font-weight: 500;">${escapeHtml(user.name || 'N/A')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Email:</td>
              <td style="padding: 6px 0;">
                <a href="mailto:${escapeHtml(user.email)}" style="color: #7c3aed; text-decoration: none;">${escapeHtml(user.email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">User ID:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 12px; color: #888;">${user.id}</td>
            </tr>
            ${business ? `
            <tr>
              <td style="padding: 6px 0; color: #666;">Business:</td>
              <td style="padding: 6px 0; font-weight: 500;">${escapeHtml(business.name)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Business ID:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 12px; color: #888;">${business.id}</td>
            </tr>
            ${business.industry ? `
            <tr>
              <td style="padding: 6px 0; color: #666;">Industry:</td>
              <td style="padding: 6px 0;">${escapeHtml(business.industry)}</td>
            </tr>
            ` : ''}
            ` : ''}
          </table>
        </div>

        <!-- Timestamp -->
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            Submitted on ${timestamp}
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 12px; color: #999;">
          This email was sent from the Selestial Support System
        </p>
      </div>

    </body>
    </html>
  `;

  const textContent = `
NEW SUPPORT REQUEST
==================

Category: ${categoryLabels[ticket.category] || ticket.category}
Priority: ${priorityLabels[ticket.priority] || ticket.priority}

Subject: ${ticket.subject}

Description:
${ticket.description}

---

Submitted By:
- Name: ${user.name || 'N/A'}
- Email: ${user.email}
- User ID: ${user.id}
${business ? `
Business:
- Name: ${business.name}
- Business ID: ${business.id}
${business.industry ? `- Industry: ${business.industry}` : ''}
` : ''}

Submitted on: ${timestamp}
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Selestial Support <noreply@selestial.io>',
        to: ['support@selestial.io'],
        reply_to: user.email,
        subject: `[${ticket.priority.toUpperCase()}] ${categoryLabels[ticket.category] || ticket.category}: ${ticket.subject}`,
        html: emailHtml,
        text: textContent,
        tags: [
          { name: 'category', value: ticket.category },
          { name: 'priority', value: ticket.priority },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send support email:', error);
    return false;
  }
}

// Helper function to escape HTML
function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

// POST /api/support
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { category, subject, description, priority } = body;

    // Validate required fields
    if (!category || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: category, subject, description' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Get user's business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, industry')
      .eq('owner_id', user.id)
      .single();

    // Try to store support ticket in database (if table exists)
    let ticketId: string | undefined;
    try {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          business_id: business?.id || null,
          category,
          subject,
          description,
          priority: priority || 'normal',
          status: 'open',
        })
        .select('id')
        .single();
      
      ticketId = ticket?.id;
    } catch (dbError) {
      // Table might not exist yet, continue with email only
      console.log('Support tickets table not found, continuing with email only:', dbError);
    }

    // Send email to support@selestial.io
    const emailSent = await sendSupportEmail({
      ticket: { category, subject, description, priority: priority || 'normal' },
      user: {
        id: user.id,
        email: user.email || profile?.email || 'unknown',
        name: profile?.full_name,
      },
      business: business || undefined,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send support request. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully',
      ticketId,
    });
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
