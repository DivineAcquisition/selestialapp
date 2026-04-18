import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Selestial port of AlphaLuxClean's `confirm-booking-payment` edge function.
 * Optimistic, client-driven path that flips `payment_status` and `status`
 * on the booking after Stripe confirms a PaymentIntent.
 *
 * The authoritative confirmation should still come from a Stripe webhook
 * (idempotent on the PaymentIntent id) — this route exists so the funnel can
 * advance immediately without waiting for the webhook round-trip.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
  }

  let body: {
    bookingId?: string;
    paymentIntentId?: string;
    paymentStatus?: 'deposit_paid' | 'paid' | 'fully_paid';
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { bookingId, paymentIntentId, paymentStatus = 'deposit_paid' } = body;
  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId || undefined,
      })
      .eq('id', bookingId)
      .eq('business_id', businessId)
      .select('id')
      .single();

    if (error || !data) {
      console.error('[confirm-payment] update error:', error);
      return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, bookingId: data.id });
  } catch (err) {
    console.error('[confirm-payment] unexpected error:', err);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
