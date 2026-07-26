import 'server-only';

import { adminDb } from '@/lib/v2/db';
import { GHL_API_BASE, GHL_API_VERSION, ghlRedirectUri } from './config';

export interface StoredToken {
  scope_type: 'agency' | 'location';
  location_id: string | null;
  company_id: string | null;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scopes: string | null;
  user_type: string | null;
  /** 'pit' rows are entered by a human and must never be auto-deleted. */
  source?: 'oauth' | 'pit';
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  userType?: string;
  companyId?: string;
  locationId?: string;
}

/** Refresh this far before real expiry so an in-flight batch never trips over it. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export class GhlAuthError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'GhlAuthError';
  }
}

async function postTokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${GHL_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(body).toString(),
    cache: 'no-store',
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new GhlAuthError(`GHL token request failed (${res.status})`, parsed);
  }

  return parsed as TokenResponse;
}

function expiryFrom(expiresIn: number | undefined): string | null {
  if (!expiresIn) return null;
  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

async function persist(
  scopeType: 'agency' | 'location',
  token: TokenResponse,
  locationId?: string | null
): Promise<StoredToken> {
  const row = {
    scope_type: scopeType,
    location_id: scopeType === 'location' ? (locationId ?? token.locationId ?? null) : null,
    company_id: token.companyId ?? process.env.GHL_AGENCY_COMPANY_ID ?? null,
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? null,
    expires_at: expiryFrom(token.expires_in),
    scopes: token.scope ?? null,
    user_type: token.userType ?? null,
    raw: { userType: token.userType, companyId: token.companyId, locationId: token.locationId },
    updated_at: new Date().toISOString(),
  };

  const db = adminDb();

  // Cannot use a single upsert: the uniqueness rules are two partial indexes rather
  // than one constraint PostgREST can name.
  const existing = await findStored(scopeType, row.location_id);
  if (existing) {
    const query = db.from('ghl_oauth_tokens').update(row).eq('scope_type', scopeType);
    if (scopeType === 'location') query.eq('location_id', row.location_id);
    const { error } = await query;
    if (error) throw new GhlAuthError('Failed to persist refreshed GHL token', error);
  } else {
    const { error } = await db.from('ghl_oauth_tokens').insert(row);
    if (error) throw new GhlAuthError('Failed to store GHL token', error);
  }

  return row as StoredToken;
}

async function findStored(
  scopeType: 'agency' | 'location',
  locationId?: string | null
): Promise<StoredToken | null> {
  const query = adminDb().from('ghl_oauth_tokens').select('*').eq('scope_type', scopeType);
  if (scopeType === 'location') query.eq('location_id', locationId ?? '');
  const { data } = await query.maybeSingle();
  return (data as StoredToken) ?? null;
}

/** Exchanges the authorization code from the agency OAuth install for an agency token. */
export async function exchangeAuthorizationCode(code: string): Promise<StoredToken> {
  const token = await postTokenRequest({
    client_id: process.env.GHL_CLIENT_ID!,
    client_secret: process.env.GHL_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    user_type: 'Company',
    redirect_uri: ghlRedirectUri(),
  });

  return persist('agency', token);
}

function isExpired(token: StoredToken): boolean {
  if (!token.expires_at) return false;
  return new Date(token.expires_at).getTime() - REFRESH_MARGIN_MS <= Date.now();
}

async function refresh(token: StoredToken): Promise<StoredToken> {
  if (!token.refresh_token) {
    throw new GhlAuthError(
      'GHL token expired and has no refresh token. Reconnect the agency at /agency/integrations.'
    );
  }

  const refreshed = await postTokenRequest({
    client_id: process.env.GHL_CLIENT_ID!,
    client_secret: process.env.GHL_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: token.refresh_token,
    user_type: token.scope_type === 'agency' ? 'Company' : 'Location',
  });

  return persist(token.scope_type, refreshed, token.location_id);
}

/** The agency (company-scoped) access token, refreshed transparently. */
export async function getAgencyToken(): Promise<StoredToken> {
  const stored = await findStored('agency');
  if (!stored) {
    throw new GhlAuthError(
      'No GHL agency token stored. Connect the agency account at /agency/integrations.'
    );
  }
  return isExpired(stored) ? refresh(stored) : stored;
}

export async function hasAgencyToken(): Promise<boolean> {
  return Boolean(await findStored('agency'));
}

/**
 * A location-scoped access token, minted from the agency token the first time it is
 * needed and refreshed from cache afterwards. GHL requires location scope for contact
 * and conversation calls even when the caller is the agency.
 */
export async function getLocationToken(locationId: string): Promise<StoredToken> {
  const stored = await findStored('location', locationId);
  if (stored && !isExpired(stored)) return stored;
  if (stored?.refresh_token && isExpired(stored)) {
    try {
      return await refresh(stored);
    } catch {
      // Fall through and mint a fresh one from the agency token.
    }
  }

  const agency = await getAgencyToken();
  const companyId = agency.company_id ?? process.env.GHL_AGENCY_COMPANY_ID;

  if (!companyId) {
    throw new GhlAuthError(
      'Cannot mint a GHL location token without a company id. Set GHL_AGENCY_COMPANY_ID.'
    );
  }

  const res = await fetch(`${GHL_API_BASE}/oauth/locationToken`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${agency.access_token}`,
      Version: GHL_API_VERSION,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({ companyId, locationId }).toString(),
    cache: 'no-store',
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new GhlAuthError(`Failed to mint GHL location token for ${locationId}`, parsed);
  }

  return persist('location', parsed as TokenResponse, locationId);
}

// ---------------------------------------------------------------------------
// Sub-account Private Integration Tokens
// ---------------------------------------------------------------------------
// The agency credential creates sub-accounts and nothing else. Each workspace then
// holds its own sub-account PIT, entered by the client or the operator, and every
// location-scoped call for that workspace uses it. This matches how GHL issues PITs
// (they are location-level) and means one client's credential cannot reach another
// client's sub-account.

export interface StoredLocationCredential {
  token: string;
  source: 'oauth' | 'pit';
  lastVerifiedAt: string | null;
}

/**
 * The credential to use for a location-scoped call, in preference order:
 *
 *   1. The sub-account PIT stored against this location — the intended model.
 *   2. An OAuth-minted location token, when the agency is connected over OAuth.
 *   3. The single global PIT from the environment, for a one-sub-account install.
 *
 * Returns null when nothing is available, so the caller can say "this workspace has
 * no sub-account token yet" rather than emitting a confusing 401.
 */
export async function resolveLocationCredential(
  locationId: string
): Promise<StoredLocationCredential | null> {
  const stored = await findStored('location', locationId);

  if (stored?.source === 'pit' && stored.access_token) {
    return { token: stored.access_token, source: 'pit', lastVerifiedAt: null };
  }

  if (stored && !isExpired(stored)) {
    return { token: stored.access_token, source: 'oauth', lastVerifiedAt: null };
  }

  if (await hasAgencyToken()) {
    try {
      const minted = await getLocationToken(locationId);
      return { token: minted.access_token, source: 'oauth', lastVerifiedAt: null };
    } catch {
      // Fall through to the environment token.
    }
  }

  const envPit = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  return envPit ? { token: envPit, source: 'pit', lastVerifiedAt: null } : null;
}

export async function hasLocationCredential(locationId: string): Promise<boolean> {
  const stored = await findStored('location', locationId);
  return Boolean(stored?.access_token);
}

/** Stores (or replaces) the sub-account PIT for a location. */
export async function storeLocationPit(params: {
  workspaceId: string;
  locationId: string;
  token: string;
  label?: string | null;
  verifiedCapabilities?: unknown;
}): Promise<void> {
  const db = adminDb();

  const row = {
    scope_type: 'location' as const,
    source: 'pit',
    workspace_id: params.workspaceId,
    location_id: params.locationId,
    access_token: params.token.trim(),
    refresh_token: null,
    // A PIT does not expire on a schedule; it is revoked in GoHighLevel.
    expires_at: null,
    label: params.label ?? null,
    last_verified_at: new Date().toISOString(),
    verified_capabilities: params.verifiedCapabilities ?? null,
    updated_at: new Date().toISOString(),
  };

  const existing = await findStored('location', params.locationId);

  const { error } = existing
    ? await db
        .from('ghl_oauth_tokens')
        .update(row)
        .eq('scope_type', 'location')
        .eq('location_id', params.locationId)
    : await db.from('ghl_oauth_tokens').insert(row);

  if (error) throw new GhlAuthError('Failed to store the sub-account token', error);
}

export async function removeLocationCredential(locationId: string): Promise<void> {
  await adminDb()
    .from('ghl_oauth_tokens')
    .delete()
    .eq('scope_type', 'location')
    .eq('location_id', locationId);
}

/**
 * Drops a cached OAuth location token after a 401, so the next call mints a fresh one.
 *
 * Deliberately scoped to `source = 'oauth'`. A sub-account PIT was typed in by a human
 * and cannot be re-minted; deleting it on a transient 401 would silently disconnect the
 * workspace and make someone go find the token again.
 */
export async function invalidateLocationToken(locationId: string): Promise<void> {
  await adminDb()
    .from('ghl_oauth_tokens')
    .delete()
    .eq('scope_type', 'location')
    .eq('location_id', locationId)
    .eq('source', 'oauth');
}
