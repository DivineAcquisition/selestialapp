import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Single plan only. The wizard no longer asks the user to choose a tier;
// every signup is the $297/mo Selestial plan. Snapshotted in cents so the
// historical record on each row reflects the price at signup time even if
// we change plan pricing later.
const STANDARD_PLAN = { id: 'standard', price_cents: 29_700 } as const;

interface ServiceLine {
  id?: string;
  name?: string;
  price?: number;
}

/**
 * POST /api/onboarding/start
 *
 * Captures a /offer/get-started submission. Server-side only writes; uses
 * the public-insert RLS policy plus service-role client (bypasses RLS) and
 * also records IP + user agent for triage.
 *
 * Returns the persisted row so the success screen on the wizard can show
 * the user's submission id and the chosen plan + offer.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const businessName = String(body.businessName ?? '').trim();
  const contactName = String(body.contactName ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!businessName || !contactName || !email) {
    return NextResponse.json(
      { error: 'businessName, contactName, and email are required' },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email looks invalid.' }, { status: 400 });
  }

  // Single-plan mode — ignore any plan field on the request and stamp every
  // signup with the standard $297/mo plan.
  const safePlan = STANDARD_PLAN.id;
  const offerCode = String(body.offerCode ?? '').slice(0, 32) || null;

  // Filter to only real services the user actually entered: name AND price > 0.
  // Services with missing data are silently dropped so we never persist
  // half-empty rows that would render as broken tiles on the live booking page.
  const services = Array.isArray(body.services)
    ? (body.services as ServiceLine[])
        .filter((s) => s && typeof s === 'object')
        .map((s) => ({
          id: typeof s.id === 'string' ? s.id : undefined,
          name: typeof s.name === 'string' ? s.name.trim().slice(0, 80) : '',
          price:
            typeof s.price === 'number' ? Math.max(0, Math.round(s.price)) : 0,
        }))
        .filter((s) => s.name.length > 0 && s.price > 0)
        .slice(0, 25)
    : [];

  if (services.length === 0) {
    return NextResponse.json(
      { error: 'Add at least one service with a price before submitting.' },
      { status: 400 }
    );
  }

  const record = {
    business_name: businessName.slice(0, 200),
    contact_name: contactName.slice(0, 200),
    email,
    phone: clean(body.phone, 64),
    website: clean(body.website, 500),
    service_area: clean(body.serviceArea, 200),
    logo_url: clean(body.logoUrl, 1000),
    brand_color: clean(body.brandColor, 32) ?? '#7c3aed',
    tagline: clean(body.tagline, 200),
    services,
    base_pricing: (body.basePricing as Record<string, unknown>) ?? {},
    recurring_discount_pct: clampInt(body.recurringDiscountPct, 0, 50, 10),
    deposit_percent: clampInt(body.depositPercent, 5, 100, 25),
    plan: safePlan,
    offer_code: offerCode,
    monthly_price_cents: STANDARD_PLAN.price_cents,
    notes: clean(body.notes, 2000),
    utms: (body.utms as Record<string, unknown>) ?? {},
    source: 'offer_page',
    user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
    ip_address:
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      null,
  };

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('onboarding_signups')
      .insert(record)
      .select('id, plan, offer_code, monthly_price_cents, status, created_at')
      .single();

    if (error || !data) {
      console.error('[onboarding/start] insert error:', error);
      return NextResponse.json(
        { error: 'Could not save your signup. Please try again or email hello@selestial.io.' },
        { status: 500 }
      );
    }

    // GHL sub-account auto-provisioning is intentionally NOT done in the
    // hot path of this route. The agency client is wired up in
    // src/lib/integrations/ghl/agency.ts and a follow-up worker (or
    // /api/onboarding/provision) will pick rows where status='submitted'
    // and call createSubAccount + createLocationApiKey, then flip the row
    // to status='ready' and stamp ghl_location_id. Doing it inline would
    // make the form take 5–10s and lose people on flaky networks.

    return NextResponse.json({ ok: true, signup: data });
  } catch (err) {
    console.error('[onboarding/start] unexpected error:', err);
    return NextResponse.json(
      { error: 'Could not save your signup. Please try again or email hello@selestial.io.' },
      { status: 500 }
    );
  }
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}
