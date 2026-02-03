import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-load admin client to prevent build-time errors
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error('Supabase configuration is missing');
    }
    
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// ============================================================================
// GET - Fetch booking widget config for a business
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const businessId = request.nextUrl.searchParams.get('businessId');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Try to fetch existing config
    const { data, error } = await supabaseAdmin
      .from('booking_widget_configs')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
      console.error('Error fetching config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      config: data?.config || null,
      id: data?.id || null,
    });
  } catch (error) {
    console.error('Error in GET /api/booking/widget-config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Save booking widget config
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, config } = body;

    if (!businessId || !config) {
      return NextResponse.json(
        { error: 'Business ID and config are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // First check if a config exists for this business
    const { data: existing } = await supabaseAdmin
      .from('booking_widget_configs')
      .select('id')
      .eq('business_id', businessId)
      .maybeSingle();

    let result;

    if (existing?.id) {
      // Update existing config
      result = await supabaseAdmin
        .from('booking_widget_configs')
        .update({
          config: config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new config
      result = await supabaseAdmin
        .from('booking_widget_configs')
        .insert({
          id: config.id || crypto.randomUUID(),
          business_id: businessId,
          config: config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving config:', result.error);
      
      // If table doesn't exist, try to store in businesses table as fallback
      if (result.error.message.includes('does not exist') || result.error.code === '42P01') {
        // Fallback: Store in businesses table metadata
        const { error: fallbackError } = await supabaseAdmin
          .from('businesses')
          .update({
            booking_widget_config: config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', businessId);

        if (fallbackError) {
          console.error('Fallback save error:', fallbackError);
          return NextResponse.json(
            { error: 'Failed to save configuration. Database table may need to be created.' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Configuration saved to business profile',
          fallback: true,
        });
      }

      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.data?.id,
    });
  } catch (error) {
    console.error('Error in POST /api/booking/widget-config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete booking widget config
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const businessId = request.nextUrl.searchParams.get('businessId');
    const configId = request.nextUrl.searchParams.get('configId');
    
    if (!businessId || !configId) {
      return NextResponse.json(
        { error: 'Business ID and Config ID are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from('booking_widget_configs')
      .delete()
      .eq('id', configId)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error deleting config:', error);
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/booking/widget-config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
