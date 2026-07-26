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

/** Drops a cached location token, forcing the next call to mint a fresh one. */
export async function invalidateLocationToken(locationId: string): Promise<void> {
  await adminDb()
    .from('ghl_oauth_tokens')
    .delete()
    .eq('scope_type', 'location')
    .eq('location_id', locationId);
}
