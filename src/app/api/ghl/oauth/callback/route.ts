import { NextResponse, type NextRequest } from 'next/server';

import { exchangeAuthorizationCode } from '@/lib/ghl/tokens';
import { logActivity } from '@/lib/v2/activity';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const redirectBase = new URL('/agency/integrations', request.nextUrl.origin);

  if (error) {
    redirectBase.searchParams.set('ghl', 'denied');
    return NextResponse.redirect(redirectBase);
  }

  if (!code) {
    redirectBase.searchParams.set('ghl', 'missing_code');
    return NextResponse.redirect(redirectBase);
  }

  try {
    const token = await exchangeAuthorizationCode(code);

    await logActivity({
      workspaceId: null,
      action: 'ghl.agency_connected',
      summary: 'Connected the GoHighLevel agency account over OAuth.',
      metadata: { companyId: token.company_id, scopes: token.scopes },
    });

    redirectBase.searchParams.set('ghl', 'connected');
    return NextResponse.redirect(redirectBase);
  } catch (err) {
    console.error('[ghl-oauth] token exchange failed', err);
    redirectBase.searchParams.set('ghl', 'failed');
    return NextResponse.redirect(redirectBase);
  }
}
