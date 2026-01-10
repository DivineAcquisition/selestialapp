import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { calculatePrice, PricingInput, validatePricingInput } from '@/lib/booking/pricing-engine';

// POST - Calculate price dynamically
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      serviceTypeId,
      bedrooms,
      bathrooms,
      sqft,
      addonSelections, // [{ addonId: string, quantity: number }]
      frequencyId,
      zipCode,
    } = body;

    // Validate basic input
    const validationErrors = validatePricingInput({
      bedrooms,
      bathrooms,
    } as Partial<PricingInput>);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Fetch service type
    const { data: serviceTypeData, error: serviceError } = await supabase
      .from('cleaning_service_types')
      .select('*')
      .eq('id', serviceTypeId)
      .eq('business_id', businessId)
      .eq('active', true)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalServiceType: any = serviceTypeData;
    if (serviceError || !serviceTypeData) {
      const { data: template } = await supabase
        .from('cleaning_service_templates')
        .select('*')
        .eq('id', serviceTypeId)
        .single();
      
      if (template) {
        finalServiceType = {
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

    if (!finalServiceType) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      );
    }

    // Fetch selected add-ons
    let addons: PricingInput['addons'] = [];
    if (addonSelections && addonSelections.length > 0) {
      const addonIds = addonSelections.map((a: { addonId: string }) => a.addonId);
      
      // Try business addons first
      let { data: addonData } = await supabase
        .from('cleaning_addons')
        .select('*')
        .in('id', addonIds)
        .eq('business_id', businessId)
        .eq('active', true);

      // If not found, try templates
      if (!addonData || addonData.length === 0) {
        const { data: addonTemplates } = await supabase
          .from('cleaning_addon_templates')
          .select('*')
          .in('id', addonIds);
        
        addonData = (addonTemplates || []).map((t: any) => ({
          ...t,
          business_id: businessId,
          min_units: 1,
          max_units: 10,
          percentage: t.price_type === 'percentage' ? 10 : 0,
        }));
      }

      if (addonData) {
        addons = addonSelections.map((selection: { addonId: string; quantity?: number }) => {
          const addon = addonData!.find((a: any) => a.id === selection.addonId);
          return { addon, quantity: selection.quantity || 1 };
        }).filter((a: any) => a.addon);
      }
    }

    // Fetch frequency if selected
    let frequency;
    if (frequencyId) {
      const { data: freqData } = await supabase
        .from('cleaning_frequencies')
        .select('*')
        .eq('id', frequencyId)
        .single();
      frequency = freqData;
    }

    // Fetch service area if zip code provided
    let area;
    if (zipCode) {
      const { data: areaData } = await supabase
        .from('cleaning_service_areas')
        .select('*')
        .eq('business_id', businessId)
        .eq('available', true)
        .contains('zip_codes', [zipCode])
        .single();
      area = areaData;
    }

    // Fetch deposit config
    const { data: config } = await supabase
      .from('cleaning_booking_config')
      .select('require_deposit, deposit_type, deposit_value, deposit_minimum')
      .eq('business_id', businessId)
      .single();

    const depositConfig = config
      ? {
          require: config.require_deposit,
          type: config.deposit_type as 'percentage' | 'flat' | 'full',
          value: config.deposit_value,
          minimum: config.deposit_minimum,
        }
      : { require: true, type: 'percentage' as const, value: 25, minimum: 25 };

    // Calculate price
    const breakdown = calculatePrice(
      {
        serviceType: finalServiceType,
        bedrooms,
        bathrooms,
        sqft,
        addons,
        frequency,
        area,
      },
      depositConfig
    );

    return NextResponse.json({
      breakdown,
      serviceType: {
        id: finalServiceType.id,
        name: finalServiceType.name,
        slug: finalServiceType.slug,
      },
      frequency: frequency
        ? {
            id: frequency.id,
            name: frequency.name,
            discountPercent: frequency.discount_value,
          }
        : null,
      area: area
        ? {
            id: area.id,
            name: area.name,
            travelFee: area.travel_fee,
          }
        : null,
    });
  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate price' },
      { status: 500 }
    );
  }
}
