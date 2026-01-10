import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Type for addon
interface Addon {
  id: string;
  business_id: string | null;
  category: string;
  name: string;
  slug: string;
  description: string | null;
  price_type: string;
  price: number;
  unit_name: string | null;
  additional_minutes: number;
  icon: string | null;
  display_order: number;
  active: boolean;
  [key: string]: unknown;
}

// GET: Fetch all add-ons for a business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    
    // Fetch addons - include global templates and business-specific
    // Use explicit any to avoid TypeScript deep instantiation error with Supabase types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const result = await client
      .from('cleaning_addons')
      .select('*')
      .or(`business_id.eq.${businessId},business_id.is.null`)
      .order('display_order', { ascending: true });
    
    const addons = result.data as Addon[] | null;
    const error = result.error;
    
    if (error) throw error;
    
    // Group by category
    type AddonsByCategory = Record<string, Addon[]>;
    const categories = addons?.reduce<AddonsByCategory>((acc, addon) => {
      const category = addon.category || 'specialty';
      if (!acc[category]) acc[category] = [];
      acc[category].push(addon);
      return acc;
    }, {});
    
    return NextResponse.json({
      addons: addons || [],
      categories,
    });
  } catch (error) {
    console.error('Fetch addons error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}

// POST: Create a new add-on
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
    
    // Generate slug from name if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    const result = await client
      .from('cleaning_addons')
      .insert({
        business_id: businessId,
        category: body.category || 'specialty',
        name: body.name,
        slug,
        description: body.description,
        price_type: body.price_type || 'flat',
        price: body.price,
        unit_name: body.unit_name,
        additional_minutes: body.additional_minutes || 15,
        icon: body.icon,
        display_order: body.display_order || 0,
        active: body.active !== false,
      })
      .select()
      .single();
    
    if (result.error) throw result.error;
    
    return NextResponse.json({ success: true, addon: result.data });
  } catch (error) {
    console.error('Create addon error:', error);
    return NextResponse.json(
      { error: 'Failed to create add-on' },
      { status: 500 }
    );
  }
}

// PUT: Update an add-on
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Add-on ID is required' }, { status: 400 });
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
    
    const result = await client
      .from('cleaning_addons')
      .update({
        category: body.category,
        name: body.name,
        description: body.description,
        price_type: body.price_type,
        price: body.price,
        unit_name: body.unit_name,
        additional_minutes: body.additional_minutes,
        icon: body.icon,
        display_order: body.display_order,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('business_id', businessId)
      .select()
      .single();
    
    if (result.error) throw result.error;
    
    return NextResponse.json({ success: true, addon: result.data });
  } catch (error) {
    console.error('Update addon error:', error);
    return NextResponse.json(
      { error: 'Failed to update add-on' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an add-on
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const addonId = searchParams.get('id');
    
    if (!addonId) {
      return NextResponse.json({ error: 'Add-on ID is required' }, { status: 400 });
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
    
    const result = await client
      .from('cleaning_addons')
      .delete()
      .eq('id', addonId)
      .eq('business_id', businessId);
    
    if (result.error) throw result.error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete addon error:', error);
    return NextResponse.json(
      { error: 'Failed to delete add-on' },
      { status: 500 }
    );
  }
}
