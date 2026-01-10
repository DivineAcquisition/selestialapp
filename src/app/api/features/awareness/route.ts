import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FeatureAwarenessService } from '@/lib/features/feature-awareness-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get('businessId');
  
  if (!businessId) {
    return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
  }
  
  try {
    const supabase = await createServerSupabaseClient();
    const service = new FeatureAwarenessService(supabase, businessId);
    
    const awareness = await service.getPlatformAwareness();
    return NextResponse.json(awareness);
  } catch (error) {
    console.error('Error fetching platform awareness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
