import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/booking/[businessId]/tenant
 *
 * Returns the per-tenant settings the AlphaLuxClean-style booking flow needs:
 * brand (name, logo, primary color, phone, website), default service area /
 * state, and the deposit %. Pulls only from columns that actually exist in
 * the live Supabase schema for `businesses`.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
  }

  try {
    const result = await getSupabaseAdmin()
      .from('businesses')
      .select(
        'id, name, owner_name, email, phone, website, industry, timezone, ' +
          'company_logo_url, company_color, deposit_percent'
      )
      .eq('id', businessId)
      .single();

    if (result.error || !result.data) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Cast to a permissive shape — the committed Database types may not
    // reflect every column we just selected (e.g. deposit_percent).
    const data = result.data as unknown as Record<string, unknown>;

    return NextResponse.json({
      tenant: {
        id: data.id as string,
        name: data.name as string,
        ownerName: (data.owner_name as string | null) ?? null,
        email: (data.email as string | null) ?? null,
        phone: (data.phone as string | null) ?? null,
        website: (data.website as string | null) ?? null,
        industry: (data.industry as string | null) ?? null,
        timezone: (data.timezone as string | null) ?? null,
        logoUrl: (data.company_logo_url as string | null) ?? null,
        primaryColor: ((data.company_color as string | null) ?? null) || '#7c3aed',
        depositPercent: (data.deposit_percent as number | null) ?? 25,
      },
    });
  } catch (err) {
    console.error('[booking tenant] error:', err);
    return NextResponse.json({ error: 'Failed to load tenant' }, { status: 500 });
  }
}
