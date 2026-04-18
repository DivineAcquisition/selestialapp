import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Selestial port of AlphaLuxClean's `emit-lead-webhook` + `track-booking-progress`.
 *
 * Records (or upserts) a partial_booking row for the tenant so the funnel can
 * be resumed and abandoned-checkout sequences can fire later. Fire-and-forget
 * — never blocks the funnel even if Supabase is degraded.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const record = {
    business_id: businessId,
    email,
    first_name: (body.firstName as string) || null,
    last_name: (body.lastName as string) || null,
    phone: (body.phone as string) || null,
    zip_code: (body.zipCode as string) || null,
    city: (body.city as string) || null,
    state: (body.state as string) || null,
    home_size: (body.homeSize as string) || null,
    service_type: (body.serviceType as string) || null,
    frequency: (body.frequency as string) || null,
    last_step: (body.step as string) || 'lead_captured',
    session_id: (body.sessionId as string) || null,
    utms: (body.utms as Record<string, unknown>) || {},
  };

  try {
    const { error } = await getSupabaseAdmin()
      .from('partial_bookings')
      .upsert(record, { onConflict: 'business_id,email' });

    if (error) {
      console.error('[lead] upsert error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }
  } catch (err) {
    console.error('[lead] unexpected error:', err);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
