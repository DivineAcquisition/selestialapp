import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch all pricing configuration for a business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    
    // Verify user owns this business
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    
    const businessResult = await client
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();
    
    if (!businessResult.data) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    // Fetch all pricing configuration in parallel
    const [
      configResult,
      sqftTiersResult,
      serviceMultipliersResult,
      addonsResult,
      frequencyDiscountsResult,
      conditionSurchargesResult,
      pricingZonesResult,
      timePricingResult
    ] = await Promise.all([
      client
        .from('cleaning_pricing_config')
        .select('*')
        .eq('business_id', businessId)
        .single(),
      client
        .from('cleaning_sqft_tiers')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('min_sqft', { ascending: true }),
      client
        .from('cleaning_service_multipliers')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('sort_order', { ascending: true }),
      client
        .from('cleaning_addons')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('display_order', { ascending: true }),
      client
        .from('cleaning_frequency_discounts')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('sort_order', { ascending: true }),
      client
        .from('cleaning_condition_surcharges')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('sort_order', { ascending: true }),
      client
        .from('cleaning_pricing_zones')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true }),
      client
        .from('cleaning_time_pricing')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('sort_order', { ascending: true }),
    ]);
    
    return NextResponse.json({
      config: configResult.data || getDefaultConfig(businessId),
      sqftTiers: sqftTiersResult.data || [],
      serviceMultipliers: serviceMultipliersResult.data || [],
      addons: addonsResult.data || [],
      frequencyDiscounts: frequencyDiscountsResult.data || [],
      conditionSurcharges: conditionSurchargesResult.data || [],
      pricingZones: pricingZonesResult.data || [],
      timePricing: timePricingResult.data || [],
    });
  } catch (error) {
    console.error('Fetch pricing config error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing configuration' },
      { status: 500 }
    );
  }
}

// PUT: Update pricing configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    
    // Verify user owns this business
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const businessResult = await client
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();
    
    if (!businessResult.data) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    // Update the main pricing config
    const result = await client
      .from('cleaning_pricing_config')
      .upsert({
        business_id: businessId,
        pricing_method: body.pricing_method,
        base_price: body.base_price,
        per_bedroom: body.per_bedroom,
        per_bathroom: body.per_bathroom,
        per_half_bath: body.per_half_bath,
        price_per_sqft: body.price_per_sqft,
        sqft_minimum_charge: body.sqft_minimum_charge,
        hourly_rate: body.hourly_rate,
        minimum_hours: body.minimum_hours,
        team_size_default: body.team_size_default,
        flat_rates: body.flat_rates,
        minimum_charge: body.minimum_charge,
        currency: body.currency,
        tax_rate: body.tax_rate,
        tax_included: body.tax_included,
        require_deposit: body.require_deposit,
        deposit_type: body.deposit_type,
        deposit_value: body.deposit_value,
        deposit_minimum: body.deposit_minimum,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'business_id',
      })
      .select()
      .single();
    
    if (result.error) {
      throw result.error;
    }
    
    return NextResponse.json({ 
      success: true, 
      config: result.data,
      message: 'Pricing configuration updated successfully' 
    });
  } catch (error) {
    console.error('Update pricing config error:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing configuration' },
      { status: 500 }
    );
  }
}

// POST: Initialize pricing config with templates
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    
    // Verify user owns this business
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const businessResult = await client
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();
    
    if (!businessResult.data) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    // Call the function to copy templates to business
    const rpcResult = await client.rpc('copy_pricing_templates_to_business', {
      p_business_id: businessId,
    });
    
    if (rpcResult.error) {
      console.error('RPC error:', rpcResult.error);
      // If RPC doesn't exist, manually initialize
      await initializePricingForBusiness(client, businessId);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pricing configuration initialized with templates' 
    });
  } catch (error) {
    console.error('Initialize pricing config error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize pricing configuration' },
      { status: 500 }
    );
  }
}

// Helper function to get default config
function getDefaultConfig(businessId: string) {
  return {
    business_id: businessId,
    pricing_method: 'bedroom_bathroom',
    base_price: 120,
    per_bedroom: 15,
    per_bathroom: 25,
    per_half_bath: 12.5,
    price_per_sqft: 0.10,
    sqft_minimum_charge: 100,
    hourly_rate: 35,
    minimum_hours: 2,
    team_size_default: 1,
    flat_rates: {
      studio: 90,
      '1br': 120,
      '2br': 160,
      '3br': 200,
      '4br': 260,
      '5br': 320,
      '6br_plus': 400,
    },
    minimum_charge: 100,
    currency: 'USD',
    tax_rate: 0,
    tax_included: false,
    require_deposit: true,
    deposit_type: 'percentage',
    deposit_value: 25,
    deposit_minimum: 25,
  };
}

// Helper function to manually initialize pricing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initializePricingForBusiness(client: any, businessId: string) {
  // Create default pricing config
  await client
    .from('cleaning_pricing_config')
    .upsert(getDefaultConfig(businessId), { onConflict: 'business_id' });
  
  // Copy service multipliers from global templates
  const globalMultipliersResult = await client
    .from('cleaning_service_multipliers')
    .select('*')
    .is('business_id', null);
  
  const globalMultipliers = globalMultipliersResult.data;
  
  if (globalMultipliers && globalMultipliers.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const businessMultipliers = globalMultipliers.map((m: any) => ({
      business_id: businessId,
      service_type: m.service_type,
      display_name: m.display_name,
      description: m.description,
      multiplier: m.multiplier,
      time_multiplier: m.time_multiplier,
      required_for_first_time: m.required_for_first_time,
      icon: m.icon,
      sort_order: m.sort_order,
      is_active: true,
    }));
    
    await client
      .from('cleaning_service_multipliers')
      .upsert(businessMultipliers, { onConflict: 'business_id,service_type' });
  }
  
  // Copy frequency discounts from global templates
  const globalFrequenciesResult = await client
    .from('cleaning_frequency_discounts')
    .select('*')
    .is('business_id', null);
  
  const globalFrequencies = globalFrequenciesResult.data;
  
  if (globalFrequencies && globalFrequencies.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const businessFrequencies = globalFrequencies.map((f: any) => ({
      business_id: businessId,
      frequency: f.frequency,
      display_name: f.display_name,
      description: f.description,
      discount_percent: f.discount_percent,
      is_baseline: f.is_baseline,
      badge_text: f.badge_text,
      sort_order: f.sort_order,
      is_active: true,
    }));
    
    await client
      .from('cleaning_frequency_discounts')
      .upsert(businessFrequencies, { onConflict: 'business_id,frequency' });
  }
}
