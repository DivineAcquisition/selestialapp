import 'server-only';

import { adminDb } from './db';

export interface CredentialStatus {
  hasToken: boolean;
  source: 'oauth' | 'pit' | null;
  lastVerifiedAt: string | null;
  verifiedCapabilities: { key: string; ok: boolean }[] | null;
}

const EMPTY: CredentialStatus = {
  hasToken: false,
  source: null,
  lastVerifiedAt: null,
  verifiedCapabilities: null,
};

/**
 * Whether a workspace has a sub-account credential stored, and what it was last verified
 * as able to do. Never returns the token itself — the only way a token leaves the
 * database is as an Authorization header on an outbound GoHighLevel call.
 */
export async function getCredentialStatus(workspaceId: string): Promise<CredentialStatus> {
  const db = adminDb();

  const { data: workspace } = await db
    .from('workspaces')
    .select('ghl_location_id')
    .eq('id', workspaceId)
    .maybeSingle();

  const locationId = workspace?.ghl_location_id as string | undefined;
  if (!locationId) return EMPTY;

  const { data } = await db
    .from('ghl_oauth_tokens')
    .select('source, last_verified_at, verified_capabilities')
    .eq('scope_type', 'location')
    .eq('location_id', locationId)
    .maybeSingle();

  if (!data) return EMPTY;

  return {
    hasToken: true,
    source: (data.source as 'oauth' | 'pit') ?? 'oauth',
    lastVerifiedAt: (data.last_verified_at as string) ?? null,
    verifiedCapabilities:
      (data.verified_capabilities as { key: string; ok: boolean }[] | null) ?? null,
  };
}
