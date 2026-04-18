import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';

/**
 * Selestial port of AlphaLuxClean's `create-payment-intent` edge function.
 *
 * Steps:
 *   1. Upsert the customer in `public.customers` for this business.
 *   2. Insert a `bookings` row in `awaiting_payment` status.
 *   3. Create a Stripe PaymentIntent for the deposit, attach metadata.
 *   4. Return `{ clientSecret, bookingId, customerId }`.
 *
 * Server-only; service-role bypasses RLS.
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
    amount?: number;
    customerData?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    bookingData?: {
      serviceType?: string;
      frequency?: string;
      homeSize?: string;
      zipCode?: string;
      offerName?: string;
      offerType?: string;
      promoCode?: string | null;
      promoDiscountCents?: number;
      basePriceCents?: number;
      depositCents?: number;
      balanceDueCents?: number;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { amount, customerData, bookingData } = body;
  if (!amount || amount <= 0 || !customerData?.email || !bookingData?.zipCode) {
    return NextResponse.json({ error: 'Missing required booking/customer fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const stripe = getStripe();

  try {
    // 1. Upsert customer
    const fullName = `${customerData.firstName ?? ''} ${customerData.lastName ?? ''}`.trim();
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', businessId)
      .eq('email', customerData.email)
      .maybeSingle();

    let customerId = existingCustomer?.id as string | undefined;
    if (!customerId) {
      const { data: inserted, error: customerError } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          name: fullName || customerData.email,
          email: customerData.email,
          phone: customerData.phone ?? '',
          address: [
            customerData.address1,
            customerData.address2,
            customerData.city,
            customerData.state,
            customerData.zip,
          ]
            .filter(Boolean)
            .join(', ') || null,
        })
        .select('id')
        .single();
      if (customerError || !inserted) {
        console.error('[payment-intent] customer insert error:', customerError);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
      }
      customerId = inserted.id;
    }

    // 2. Insert booking in awaiting_payment
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        zip_code: bookingData.zipCode,
        city: customerData.city ?? null,
        state: customerData.state ?? null,
        home_size_id: bookingData.homeSize ?? null,
        service_type: bookingData.serviceType ?? 'deep',
        frequency: bookingData.frequency ?? 'one_time',
        offer_type: bookingData.offerType ?? null,
        offer_name: bookingData.offerName ?? null,
        customer_name: fullName,
        customer_email: customerData.email,
        customer_phone: customerData.phone ?? null,
        base_price_cents: bookingData.basePriceCents ?? 0,
        promo_discount_cents: bookingData.promoDiscountCents ?? 0,
        deposit_cents: bookingData.depositCents ?? Math.round(amount * 100),
        balance_due_cents: bookingData.balanceDueCents ?? 0,
        promo_code: bookingData.promoCode ?? null,
        status: 'awaiting_payment',
        payment_status: 'unpaid',
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      console.error('[payment-intent] booking insert error:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // 3. Stripe PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      receipt_email: customerData.email,
      metadata: {
        business_id: businessId,
        booking_id: booking.id,
        customer_id: customerId ?? '',
        offer_type: bookingData.offerType ?? '',
      },
      automatic_payment_methods: { enabled: true },
    });

    // 4. Persist intent id on the booking row
    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: intent.id })
      .eq('id', booking.id);

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      bookingId: booking.id,
      customerId,
    });
  } catch (err) {
    console.error('[payment-intent] unexpected error:', err);
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
  }
}
