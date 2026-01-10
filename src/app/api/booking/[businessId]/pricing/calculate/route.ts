import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculatePrice, PricingInput, quickEstimate } from '@/lib/booking/ai-pricing-engine';

// Create Supabase client for API routes
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.bedrooms === undefined || body.bathrooms === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: bedrooms and bathrooms are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    // Build pricing input
    const input: PricingInput = {
      businessId,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      halfBaths: body.halfBaths,
      squareFootage: body.squareFootage || body.sqft,
      homeType: body.homeType,
      floors: body.floors,
      serviceType: body.serviceType || 'standard',
      frequency: body.frequency || 'one_time',
      addons: body.addons,
      pets: body.pets,
      lastCleanedDays: body.lastCleanedDays,
      clutterLevel: body.clutterLevel,
      hasHighCeilings: body.hasHighCeilings,
      stairFlights: body.stairFlights,
      zipCode: body.zipCode,
      requestedDate: body.requestedDate,
      requestedTime: body.requestedTime,
      hoursNotice: body.hoursNotice,
      isNewCustomer: body.isNewCustomer,
      isFirstBooking: body.isFirstBooking,
    };
    
    const breakdown = await calculatePrice(supabase, input);
    
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate price', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Quick estimate endpoint (GET for simpler requests)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const bedrooms = parseInt(searchParams.get('bedrooms') || '2', 10);
    const bathrooms = parseFloat(searchParams.get('bathrooms') || '1');
    const serviceType = searchParams.get('serviceType') || 'standard';
    const frequency = searchParams.get('frequency') || 'one_time';
    
    const estimate = quickEstimate(bedrooms, bathrooms, serviceType, frequency);
    
    return NextResponse.json({
      estimate,
      disclaimer: 'This is an estimate. Final price may vary based on property condition and selected add-ons.',
    });
  } catch (error) {
    console.error('Quick estimate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate estimate' },
      { status: 500 }
    );
  }
}
