import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FeatureAwarenessService } from '@/lib/features/feature-awareness-service';
import type { FeatureKey } from '@/lib/features/feature-registry';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ featureKey: string }> }
) {
  try {
    const { businessId } = await request.json();
    const { featureKey } = await params;
    
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }
    
    const supabase = await createServerSupabaseClient();
    const service = new FeatureAwarenessService(supabase, businessId);
    
    const result = await service.disableFeature(featureKey as FeatureKey);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling feature:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
