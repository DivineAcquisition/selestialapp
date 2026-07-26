import { NextResponse } from 'next/server';

import { GHL_MARKETPLACE_BASE, GHL_OAUTH_SCOPES, ghlOAuthConfigured, ghlRedirectUri } from '@/lib/ghl/config';
import { requireAgencyAdmin } from '@/lib/v2/workspace';

export const runtime = 'nodejs';

/**
 * Kicks off the agency-level OAuth install. Agency admins only — the resulting token
 * can act on every sub-account under the agency.
 */
export async function GET() {
  try {
    await requireAgencyAdmin();
  } catch {
    return NextResponse.json({ error: 'Agency admin access required' }, { status: 403 });
  }

  if (!ghlOAuthConfigured()) {
    return NextResponse.json(
      { error: 'Set GHL_CLIENT_ID and GHL_CLIENT_SECRET before connecting GoHighLevel.' },
      { status: 409 }
    );
  }

  const url = new URL('/oauth/chooselocation', GHL_MARKETPLACE_BASE);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', process.env.GHL_CLIENT_ID!);
  url.searchParams.set('redirect_uri', ghlRedirectUri());
  url.searchParams.set('scope', GHL_OAUTH_SCOPES);

  return NextResponse.redirect(url.toString());
}
