import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// GET - Fetch all customization data for a business
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    // Fetch all customization data in parallel
    const [
      serviceAreasResult,
      pricingModelResult,
      promotionsResult,
      brandingResult,
      copyResult,
      settingsResult,
    ] = await Promise.all([
      (supabase as any)
        .from('cleaning_service_areas')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order'),
      (supabase as any)
        .from('cleaning_pricing_models')
        .select('*')
        .eq('business_id', businessId)
        .single(),
      (supabase as any)
        .from('cleaning_promotions')
        .select('*')
        .eq('business_id', businessId)
        .order('priority', { ascending: false }),
      (supabase as any)
        .from('cleaning_widget_branding')
        .select('*')
        .eq('business_id', businessId)
        .single(),
      (supabase as any)
        .from('cleaning_widget_copy')
        .select('*')
        .eq('business_id', businessId)
        .single(),
      (supabase as any)
        .from('cleaning_widget_settings')
        .select('*')
        .eq('business_id', businessId)
        .single(),
    ]);
    
    return NextResponse.json({
      service_areas: serviceAreasResult.data || [],
      pricing_model: pricingModelResult.data || {},
      promotions: promotionsResult.data || [],
      branding: brandingResult.data || {},
      copy: copyResult.data || {},
      settings: settingsResult.data || {},
    });
  } catch (error) {
    console.error('Error fetching customization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customization data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update specific customization section
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const body = await request.json();
    const { type, data } = body;
    
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (type) {
      case 'service_areas':
        // Delete existing and insert new
        await (supabase as any)
          .from('cleaning_service_areas')
          .delete()
          .eq('business_id', businessId);
        
        if (data.length > 0) {
          result = await (supabase as any)
            .from('cleaning_service_areas')
            .insert(
              data.map((area: any, index: number) => ({
                ...area,
                business_id: businessId,
                display_order: index,
              }))
            );
        }
        break;
        
      case 'pricing_model':
        result = await (supabase as any)
          .from('cleaning_pricing_models')
          .upsert({
            ...data,
            business_id: businessId,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'business_id' });
        break;
        
      case 'promotions':
        // Delete existing and insert new
        await (supabase as any)
          .from('cleaning_promotions')
          .delete()
          .eq('business_id', businessId);
        
        if (data.length > 0) {
          result = await (supabase as any)
            .from('cleaning_promotions')
            .insert(
              data.map((promo: any) => ({
                ...promo,
                business_id: businessId,
              }))
            );
        }
        break;
        
      case 'branding':
        result = await (supabase as any)
          .from('cleaning_widget_branding')
          .upsert({
            ...data,
            business_id: businessId,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'business_id' });
        break;
        
      case 'copy':
        result = await (supabase as any)
          .from('cleaning_widget_copy')
          .upsert({
            ...data,
            business_id: businessId,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'business_id' });
        break;
        
      case 'settings':
        result = await (supabase as any)
          .from('cleaning_widget_settings')
          .upsert({
            ...data,
            business_id: businessId,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'business_id' });
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown customization type: ${type}` },
          { status: 400 }
        );
    }
    
    if (result?.error) {
      console.error(`Error updating ${type}:`, result.error);
      return NextResponse.json(
        { error: `Failed to update ${type}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error('Error updating customization:', error);
    return NextResponse.json(
      { error: 'Failed to update customization' },
      { status: 500 }
    );
  }
}
