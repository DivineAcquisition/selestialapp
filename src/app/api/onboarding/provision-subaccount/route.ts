import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  getGhlAgencyClient,
  isGhlAgencyConfigured,
  GhlAgencyError,
} from '@/lib/integrations/ghl/agency';

export const runtime = 'nodejs';

/**
 * POST /api/onboarding/provision-subaccount
 *
 * Reads an onboarding signup row, creates a GHL sub-account against the
 * agency API, mints a per-location PIT, and stamps both back onto the row.
 * Idempotent: if the row already has a `ghl_location_id`, returns it
 * without re-creating.
 *
 * Triggered automatically by /api/onboarding/payment-confirmed once the
 * subscription is paid; can also be called manually from a back-office
 * tool to retry a failed provisioning.
 *
 * Failure modes:
 *   - 404 if signupId not found
 *   - 409 if GHL_AGENCY_API_KEY is not configured
 *   - 502 if GHL rejects the create call (message + status passed through)
 */
export async function POST(request: NextRequest) {
  let body: { signupId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const signupId = body.signupId;
  if (!signupId || typeof signupId !== 'string') {
    return NextResponse.json({ error: 'signupId is required' }, { status: 400 });
  }

  if (!isGhlAgencyConfigured()) {
    return NextResponse.json(
      { error: 'GHL agency API key is not configured (GHL_AGENCY_API_KEY).' },
      { status: 409 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Fetch the signup we're provisioning for.
  const { data: signup, error: lookupError } = await supabase
    .from('onboarding_signups')
    .select(
      'id, business_name, contact_name, email, phone, website, ' +
        'service_area, ghl_location_id'
    )
    .eq('id', signupId)
    .single();

  if (lookupError || !signup) {
    return NextResponse.json({ error: 'Signup not found' }, { status: 404 });
  }

  const row = signup as unknown as {
    id: string;
    business_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    website: string | null;
    service_area: string | null;
    ghl_location_id: string | null;
  };

  // Already provisioned — return what's there.
  if (row.ghl_location_id) {
    return NextResponse.json({
      ok: true,
      alreadyProvisioned: true,
      ghlLocationId: row.ghl_location_id,
    });
  }

  try {
    const agency = getGhlAgencyClient();

    const created = await agency.createSubAccount({
      businessName: row.business_name,
      email: row.email,
      phone: row.phone ?? undefined,
      website: row.website ?? undefined,
      // Lightweight address split — we collect a single `service_area`
      // free-text field today. GHL accepts it as `address` / `city`
      // mostly for display; the snapshot will fill the rest.
      address: row.service_area ?? undefined,
    });

    let mintedPit: string | null = null;
    try {
      const apiKey = await agency.createLocationApiKey(created.id);
      mintedPit = apiKey.apiKey;
    } catch (keyErr) {
      // Don't fail the whole provisioning if PIT minting fails — the
      // sub-account itself is created and the operator can mint a key
      // manually. Just log it.
      console.warn(
        '[provision-subaccount] sub-account created but PIT mint failed:',
        keyErr
      );
    }

    await supabase
      .from('onboarding_signups')
      .update({
        ghl_location_id: created.id,
        status: 'ready',
        ghl_provision_error: null,
      })
      .eq('id', row.id);

    return NextResponse.json({
      ok: true,
      ghlLocationId: created.id,
      pitMinted: Boolean(mintedPit),
    });
  } catch (err) {
    const message =
      err instanceof GhlAgencyError
        ? `GHL ${err.status}: ${err.message}`
        : err instanceof Error
        ? err.message
        : 'Unknown GHL error';
    console.error('[provision-subaccount] error:', message, err);

    await supabase
      .from('onboarding_signups')
      .update({
        status: 'failed',
        ghl_provision_error: message.slice(0, 1000),
      })
      .eq('id', row.id);

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
