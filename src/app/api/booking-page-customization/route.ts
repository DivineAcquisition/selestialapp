import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Public endpoint backing the "Want your own branded booking page?" form on
 * the welcome page. Records the request in `booking_page_requests` and
 * (optionally) emails sales via Resend.
 *
 * No auth — open to anonymous visitors. RLS on the table allows anon INSERTs
 * via the public policy in the 20260418 migration; service role insert here
 * bypasses RLS and also records IP + user agent for triage.
 */

const SALES_NOTIFY_EMAIL =
  process.env.BOOKING_PAGE_REQUEST_NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@selestial.io';

type Payload = {
  businessName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  serviceArea?: string;
  homeSizeFocus?: string;
  servicesOffered?: string;
  brandColor?: string;
  notes?: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clean(value: string | undefined, max = 1000): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

async function notifyByEmail(record: Record<string, unknown>): Promise<void> {
  if (!process.env.RESEND_API_KEY || !SALES_NOTIFY_EMAIL) return;

  const rows = Object.entries(record)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border:1px solid #eee;font-weight:600;background:#f8f9fa">${k}</td><td style="padding:6px 12px;border:1px solid #eee">${String(
          v
        )
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:20px;border-radius:12px 12px 0 0;color:white">
        <h2 style="margin:0">New booking-page customization request</h2>
        <p style="margin:6px 0 0;opacity:0.85">From access.selestial.io / welcome page</p>
      </div>
      <table style="border-collapse:collapse;width:100%;border:1px solid #eee">
        ${rows}
      </table>
    </div>
  `.trim();

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: SALES_NOTIFY_EMAIL,
        subject: `New booking-page request: ${record.business_name || 'Unknown business'}`,
        html,
      }),
    });
  } catch (err) {
    console.error('[booking-page-customization] notify email failed:', err);
  }
}

export async function POST(request: NextRequest) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const businessName = clean(payload.businessName, 200);
  const contactName = clean(payload.contactName, 200);
  const email = clean(payload.email, 320);

  if (!businessName || !contactName || !email) {
    return NextResponse.json(
      { error: 'businessName, contactName, and email are required.' },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Email looks invalid.' }, { status: 400 });
  }

  const record = {
    business_name: businessName,
    contact_name: contactName,
    email,
    phone: clean(payload.phone, 64),
    website: clean(payload.website, 500),
    service_area: clean(payload.serviceArea, 200),
    home_size_focus: clean(payload.homeSizeFocus, 500),
    services_offered: clean(payload.servicesOffered, 2000),
    brand_color: clean(payload.brandColor, 32),
    notes: clean(payload.notes, 2000),
    source: 'welcome_page_customization_form',
    user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
    ip_address:
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      null,
  };

  try {
    const { error } = await getSupabaseAdmin()
      .from('booking_page_requests')
      .insert(record);

    if (error) {
      console.error('[booking-page-customization] insert error:', error);
      return NextResponse.json(
        { error: 'Could not save your request. Please try again or email us directly.' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('[booking-page-customization] unexpected error:', err);
    return NextResponse.json(
      { error: 'Could not save your request. Please try again or email us directly.' },
      { status: 500 }
    );
  }

  // Fire-and-forget email notification. Failure here doesn't fail the request.
  void notifyByEmail(record);

  return NextResponse.json({ ok: true });
}
