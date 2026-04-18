import { NextResponse, type NextRequest } from 'next/server';

/**
 * Selestial port of AlphaLuxClean's `validate-zip` edge function.
 *
 * v1: stub that accepts any 5-digit US ZIP and returns city/state from a
 * lightweight public lookup (zippopotam.us). When per-tenant service-area
 * gating ships, this route will check `booking_widget_configs.serviceZips`
 * before returning `isValid: true`.
 */
export async function POST(request: NextRequest) {
  let body: { zipCode?: string };
  try {
    body = (await request.json()) as { zipCode?: string };
  } catch {
    return NextResponse.json({ isValid: false, message: 'Invalid request body' }, { status: 400 });
  }

  const zip = (body.zipCode || '').trim();
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ isValid: false, message: 'Please enter a valid 5-digit ZIP code' });
  }

  try {
    const lookup = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: 'no-store' });
    if (!lookup.ok) {
      return NextResponse.json({ isValid: false, message: "We don't service this area yet." });
    }
    const data = (await lookup.json()) as {
      places?: Array<{ 'place name'?: string; 'state abbreviation'?: string }>;
    };
    const place = data.places?.[0];
    return NextResponse.json({
      isValid: true,
      city: place?.['place name'] ?? '',
      state: place?.['state abbreviation'] ?? '',
    });
  } catch (err) {
    console.error('[validate-zip] lookup failed:', err);
    // Fall through and accept the ZIP without city/state so the funnel
    // doesn't dead-end on a third-party outage.
    return NextResponse.json({ isValid: true, city: '', state: '' });
  }
}
