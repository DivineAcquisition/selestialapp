import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Selestial port of AlphaLuxClean's `save-booking-details` edge function.
 * Writes the address, scheduled date, time slot, and special instructions to
 * the existing booking row created during checkout. Marks the booking as
 * `scheduled` once details are present.
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
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    state?: string;
    zipCode?: string;
    serviceDate?: string;
    timeSlot?: string;
    specialInstructions?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    bookingId,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    serviceDate,
    timeSlot,
    specialInstructions,
  } = body;

  if (!bookingId || !addressLine1 || !city || !state || !zipCode || !serviceDate || !timeSlot) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  const fullAddress = [addressLine1, addressLine2, `${city}, ${state} ${zipCode}`]
    .filter(Boolean)
    .join(', ');

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        service_address: fullAddress,
        service_date: serviceDate,
        time_slot: timeSlot,
        special_instructions: specialInstructions ?? null,
        status: 'scheduled',
      })
      .eq('id', bookingId)
      .eq('business_id', businessId)
      .select('id')
      .single();

    if (error || !data) {
      console.error('[save-details] update error:', error);
      return NextResponse.json({ success: false, error: 'Failed to save details' }, { status: 500 });
    }
    return NextResponse.json({ success: true, bookingId: data.id });
  } catch (err) {
    console.error('[save-details] unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Failed to save details' }, { status: 500 });
  }
}
