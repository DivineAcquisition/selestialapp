import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, key);
}

// GET - Fetch booking configuration for widget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = getSupabaseClient();

    // Fetch all configuration in parallel
    const [
      { data: business },
      { data: config },
      { data: serviceTypes },
      { data: addons },
      { data: frequencies },
      { data: propertyPresets },
      { data: serviceAreas },
    ] = await Promise.all([
      supabase
        .from('businesses')
        .select('id, name, logo_url, phone, email')
        .eq('id', businessId)
        .single(),
      supabase
        .from('cleaning_booking_config')
        .select('*')
        .eq('business_id', businessId)
        .single(),
      supabase
        .from('cleaning_service_types')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .order('display_order'),
      supabase
        .from('cleaning_addons')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .order('display_order'),
      supabase
        .from('cleaning_frequencies')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .eq('active', true)
        .order('display_order'),
      supabase
        .from('cleaning_property_presets')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .eq('active', true)
        .order('display_order'),
      supabase
        .from('cleaning_service_areas')
        .select('*')
        .eq('business_id', businessId)
        .eq('available', true)
        .order('display_order'),
    ]);

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Use defaults if no custom config
    const defaultConfig = {
      require_deposit: true,
      deposit_type: 'percentage',
      deposit_value: 25,
      deposit_minimum: 25,
      accept_cash: true,
      accept_card: true,
      lead_time_hours: 24,
      max_advance_days: 60,
      slot_duration_minutes: 30,
      operating_hours: {
        mon: { start: '08:00', end: '17:00', enabled: true },
        tue: { start: '08:00', end: '17:00', enabled: true },
        wed: { start: '08:00', end: '17:00', enabled: true },
        thu: { start: '08:00', end: '17:00', enabled: true },
        fri: { start: '08:00', end: '17:00', enabled: true },
        sat: { start: '09:00', end: '14:00', enabled: true },
        sun: { start: null, end: null, enabled: false },
      },
      primary_color: '#7c3aed',
      send_confirmation_email: true,
      send_confirmation_sms: true,
    };

    // If no service types configured, use templates
    let finalServiceTypes = serviceTypes || [];
    if (finalServiceTypes.length === 0) {
      const { data: templates } = await supabase
        .from('cleaning_service_templates')
        .select('*')
        .order('display_order');
      
      finalServiceTypes = (templates || []).map((t: any) => ({
        ...t,
        business_id: businessId,
        pricing_method: t.pricing_method || 'bedroom_bathroom',
        price_per_half_bath: 10,
        price_per_sqft: 0.10,
        sqft_tiers: [],
        hourly_rate: 45,
        estimated_hours_base: 2,
        hours_per_bedroom: 0.5,
        hours_per_bathroom: 0.5,
        min_duration_minutes: 60,
        max_duration_minutes: 240,
        active: true,
      }));
    }

    // If no addons configured, use templates
    let finalAddons = addons || [];
    if (finalAddons.length === 0) {
      const { data: addonTemplates } = await supabase
        .from('cleaning_addon_templates')
        .select('*')
        .order('display_order');
      
      finalAddons = (addonTemplates || []).map((t: any) => ({
        ...t,
        business_id: businessId,
        min_units: 1,
        max_units: 10,
        percentage: t.price_type === 'percentage' ? 10 : 0,
        popular: false,
        active: true,
      }));
    }

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        logo: business.logo_url,
        phone: business.phone,
        email: business.email,
      },
      config: config || defaultConfig,
      serviceTypes: finalServiceTypes,
      addons: finalAddons,
      frequencies: frequencies || [],
      propertyPresets: propertyPresets || [],
      serviceAreas: serviceAreas || [],
    });
  } catch (error) {
    console.error('Booking config error:', error);
    return NextResponse.json(
      { error: 'Failed to load booking configuration' },
      { status: 500 }
    );
  }
}
