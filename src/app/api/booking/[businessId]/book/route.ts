import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';
import { calculatePrice } from '@/lib/booking/pricing-engine';

// POST - Create booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      // Service selection
      serviceTypeId,
      bedrooms,
      bathrooms,
      sqft,
      addonSelections,
      frequencyId,
      
      // Scheduling
      scheduledDate,
      scheduledTime,
      
      // Customer info
      customerName,
      customerEmail,
      customerPhone,
      
      // Address
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      
      // Additional
      accessInstructions,
      hasPets,
      petDetails,
      specialRequests,
      
      // Payment
      paymentMethodId,
    } = body;

    // Validate required fields
    if (!serviceTypeId || !scheduledDate || !scheduledTime || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch service type
    const { data: serviceTypeData } = await supabase
      .from('cleaning_service_types')
      .select('*')
      .eq('id', serviceTypeId)
      .eq('business_id', businessId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let serviceType: any = serviceTypeData;

    // Try templates if not found
    if (!serviceType) {
      const { data: template } = await supabase
        .from('cleaning_service_templates')
        .select('*')
        .eq('id', serviceTypeId)
        .single();
      
      if (template) {
        serviceType = {
          ...(template as Record<string, unknown>),
          business_id: businessId,
          price_per_half_bath: 10,
          price_per_sqft: 0.10,
          sqft_tiers: [],
          hourly_rate: 45,
          estimated_hours_base: 2,
          hours_per_bedroom: 0.5,
          hours_per_bathroom: 0.5,
          min_duration_minutes: 60,
          max_duration_minutes: 240,
        };
      }
    }

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      );
    }

    // Fetch add-ons
    let addons: Array<{ addon: any; quantity: number }> = [];
    if (addonSelections?.length > 0) {
      const addonIds = addonSelections.map((a: { addonId: string }) => a.addonId);
      
      const { data: addonDataResult } = await supabase
        .from('cleaning_addons')
        .select('*')
        .in('id', addonIds)
        .eq('business_id', businessId);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let addonData: any[] = addonDataResult as any[] || [];
      
      // Try templates if not found
      if (addonData.length === 0) {
        const { data: addonTemplates } = await supabase
          .from('cleaning_addon_templates')
          .select('*')
          .in('id', addonIds);
        
        addonData = ((addonTemplates as any[]) || []).map((t: any) => ({
          ...t,
          min_units: 1,
          max_units: 10,
          percentage: t.price_type === 'percentage' ? 10 : 0,
        }));
      }
      
      addons = addonSelections.map((selection: { addonId: string; quantity?: number }) => ({
        addon: addonData.find((a: any) => a.id === selection.addonId),
        quantity: selection.quantity || 1,
      })).filter((a: { addon: any }) => a.addon);
    }

    // Fetch frequency
    let frequency;
    if (frequencyId) {
      const { data } = await supabase
        .from('cleaning_frequencies')
        .select('*')
        .eq('id', frequencyId)
        .single();
      frequency = data;
    }

    // Fetch config for deposit
    const { data: config } = await supabase
      .from('cleaning_booking_config')
      .select('*')
      .eq('business_id', businessId)
      .single();

    const depositConfig = {
      require: config?.require_deposit ?? true,
      type: (config?.deposit_type ?? 'percentage') as 'percentage' | 'flat' | 'full',
      value: config?.deposit_value ?? 25,
      minimum: config?.deposit_minimum ?? 25,
    };

    // Calculate final price
    const breakdown = calculatePrice(
      { serviceType, bedrooms, bathrooms, sqft, addons, frequency },
      depositConfig
    );

    // Get business Stripe account
    const { data: business } = await supabase
      .from('businesses')
      .select('stripe_account_id, name')
      .eq('id', businessId)
      .single();

    // Create Stripe payment intent for deposit if payment method provided
    let paymentIntent;
    if (breakdown.depositAmount > 0 && paymentMethodId && business?.stripe_account_id) {
      try {
        const platformFee = Math.round(breakdown.depositAmount * 0.005 * 100); // 0.5% platform fee
        
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(breakdown.depositAmount * 100),
          currency: 'usd',
          payment_method: paymentMethodId,
          confirmation_method: 'manual',
          confirm: true,
          application_fee_amount: platformFee,
          transfer_data: {
            destination: business.stripe_account_id,
          },
          receipt_email: customerEmail,
          metadata: {
            business_id: businessId,
            booking_type: 'cleaning',
            service_type: serviceType.name,
          },
        });
      } catch (stripeError: any) {
        console.error('Stripe payment error:', stripeError);
        // Continue without payment - booking will be pending
      }
    }

    // Create or find customer
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', businessId)
      .eq('email', customerEmail)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      
      // Update customer info
      await supabase
        .from('customers')
        .update({
          phone: customerPhone,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          zip_code: zipCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);
    } else {
      const nameParts = customerName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          first_name: firstName,
          last_name: lastName,
          email: customerEmail,
          phone: customerPhone,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          zip_code: zipCode,
          source: 'booking_widget',
        })
        .select('id')
        .single();
      
      customerId = newCustomer?.id;
    }

    // Determine booking status
    const depositPaid = paymentIntent?.status === 'succeeded';
    const bookingStatus = depositPaid ? 'confirmed' : 'pending';

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('cleaning_bookings')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        service_type_id: serviceTypeId,
        service_name: serviceType.name,
        bedrooms,
        bathrooms,
        sqft,
        addons: addons.map(({ addon, quantity }) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          price_type: addon.price_type,
          quantity,
        })),
        frequency_id: frequencyId,
        frequency_name: frequency?.name,
        frequency_discount: breakdown.frequencyDiscount,
        base_price: breakdown.serviceSubtotal,
        addons_total: breakdown.addonsTotal,
        subtotal: breakdown.subtotal,
        discount_amount: breakdown.totalDiscount,
        total_price: breakdown.total,
        deposit_amount: breakdown.depositAmount,
        deposit_paid: depositPaid,
        deposit_paid_at: depositPaid ? new Date().toISOString() : null,
        scheduled_date: scheduledDate,
        scheduled_time_start: scheduledTime,
        estimated_duration_minutes: breakdown.estimatedMinutes,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        zip_code: zipCode,
        access_instructions: accessInstructions,
        has_pets: hasPets,
        pet_details: petDetails,
        special_requests: specialRequests,
        status: bookingStatus,
        stripe_payment_intent_id: paymentIntent?.id,
        source: 'widget',
        confirmed_at: depositPaid ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation email & SMS
    // await sendBookingConfirmation(booking);

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.booking_number,
        status: booking.status,
        scheduledDate: booking.scheduled_date,
        scheduledTime: booking.scheduled_time_start,
        total: booking.total_price,
        depositPaid: booking.deposit_paid,
        depositAmount: booking.deposit_amount,
      },
      message: booking.deposit_paid
        ? 'Booking confirmed! You will receive a confirmation email shortly.'
        : 'Booking received! Please complete payment to confirm.',
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
