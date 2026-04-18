import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Read endpoint for the confirmation page. Server-side so RLS doesn't block
 * the anonymous customer fetching their own booking immediately after paying.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const url = new URL(request.url);
  const bookingId = url.searchParams.get('booking_id');
  if (!businessId || !bookingId) {
    return NextResponse.json({ error: 'businessId and booking_id are required' }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('bookings')
      .select(
        'id, customer_name, customer_email, customer_phone, service_type, frequency, ' +
          'service_date, time_slot, service_address, base_price_cents, deposit_cents, ' +
          'balance_due_cents, payment_status, status, offer_name'
      )
      .eq('id', bookingId)
      .eq('business_id', businessId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error('[confirmation] error:', err);
    return NextResponse.json({ error: 'Failed to load booking' }, { status: 500 });
  }
}
