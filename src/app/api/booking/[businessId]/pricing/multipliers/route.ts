import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Type for service multiplier
interface ServiceMultiplier {
  id: string;
  business_id: string | null;
  service_type: string;
  display_name: string;
  description: string | null;
  multiplier: number;
  time_multiplier: number;
  is_active: boolean;
  required_for_first_time: boolean;
  icon: string | null;
  color: string | null;
  sort_order: number;
  [key: string]: unknown;
}

// GET: Fetch all service multipliers for a business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    
    // Fetch multipliers - include global templates and business-specific
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const result = await client
      .from('cleaning_service_multipliers')
      .select('*')
      .or(`business_id.eq.${businessId},business_id.is.null`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    const multipliers = result.data as ServiceMultiplier[] | null;
    const error = result.error;
    
    if (error) throw error;
    
    return NextResponse.json({
      multipliers: multipliers || [],
    });
  } catch (error) {
    console.error('Fetch multipliers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service multipliers' },
      { status: 500 }
    );
  }
}

// POST: Create or update a service multiplier
export async function POST(
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
    
    const result = await client
      .from('cleaning_service_multipliers')
      .upsert({
        business_id: businessId,
        service_type: body.service_type,
        display_name: body.display_name,
        description: body.description,
        multiplier: body.multiplier || 1.0,
        fixed_price_per_sqft: body.fixed_price_per_sqft,
        time_multiplier: body.time_multiplier || 1.0,
        is_active: body.is_active !== false,
        required_for_first_time: body.required_for_first_time || false,
        icon: body.icon,
        color: body.color,
        sort_order: body.sort_order || 0,
      }, {
        onConflict: 'business_id,service_type',
      })
      .select()
      .single();
    
    if (result.error) throw result.error;
    
    return NextResponse.json({ success: true, multiplier: result.data });
  } catch (error) {
    console.error('Upsert multiplier error:', error);
    return NextResponse.json(
      { error: 'Failed to save service multiplier' },
      { status: 500 }
    );
  }
}

// PUT: Update multiple service multipliers at once
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
    
    // Expect body.multipliers to be an array
    if (!Array.isArray(body.multipliers)) {
      return NextResponse.json({ error: 'multipliers array is required' }, { status: 400 });
    }
    
    const multipliersToUpsert = body.multipliers.map((m: Record<string, unknown>) => ({
      business_id: businessId,
      service_type: m.service_type,
      display_name: m.display_name,
      description: m.description,
      multiplier: m.multiplier || 1.0,
      fixed_price_per_sqft: m.fixed_price_per_sqft,
      time_multiplier: m.time_multiplier || 1.0,
      is_active: m.is_active !== false,
      required_for_first_time: m.required_for_first_time || false,
      icon: m.icon,
      color: m.color,
      sort_order: m.sort_order || 0,
    }));
    
    const result = await client
      .from('cleaning_service_multipliers')
      .upsert(multipliersToUpsert, {
        onConflict: 'business_id,service_type',
      })
      .select();
    
    if (result.error) throw result.error;
    
    return NextResponse.json({ success: true, multipliers: result.data });
  } catch (error) {
    console.error('Bulk update multipliers error:', error);
    return NextResponse.json(
      { error: 'Failed to update service multipliers' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a service multiplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType');
    
    if (!serviceType) {
      return NextResponse.json({ error: 'serviceType is required' }, { status: 400 });
    }
    
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
    
    // Instead of deleting, set is_active to false
    const result = await client
      .from('cleaning_service_multipliers')
      .update({ is_active: false })
      .eq('business_id', businessId)
      .eq('service_type', serviceType);
    
    if (result.error) throw result.error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete multiplier error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service multiplier' },
      { status: 500 }
    );
  }
}
