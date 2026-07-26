import 'server-only';

import { adminDb } from '@/lib/v2/db';
import {
  GHL_API_BASE,
  GHL_API_VERSION,
  GHL_V1_BASE,
  ghlAgencyKeyConfigured,
  ghlPitConfigured,
  resolveAuthMode,
} from './config';
import {
  getAgencyToken,
  invalidateLocationToken,
  resolveLocationCredential,
} from './tokens';

export class GhlError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
    readonly operation: string
  ) {
    super(message);
    this.name = 'GhlError';
  }

  /** True when retrying the exact same request could plausibly succeed. */
  get retryable(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}

export type GhlScope =
  | { kind: 'agency' }
  | { kind: 'location'; locationId: string }
  | { kind: 'v1' };

export interface GhlRequestOptions {
  operation: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  scope: GhlScope;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  workspaceId?: string | null;
  idempotencyKey?: string;
  /** Total attempts including the first. */
  maxAttempts?: number;
  /** Treat these statuses as success and return the parsed body instead of throwing. */
  tolerate?: number[];
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
// GHL allows a burst of 100 requests per 10 seconds per resource. This is a
// per-instance token bucket, so it does not coordinate across serverless
// instances — it exists to keep our own bulk loops (importing a 5,000-row list,
// dispatching a send batch) from tripping the limit on their own. The 429 retry
// path below is what handles contention between instances.

const BURST_LIMIT = Number(process.env.GHL_BURST_LIMIT || 90);
const BURST_WINDOW_MS = 10_000;

const buckets = new Map<string, number[]>();

async function throttle(key: string): Promise<void> {
  for (;;) {
    const now = Date.now();
    const recent = (buckets.get(key) ?? []).filter((t) => now - t < BURST_WINDOW_MS);

    if (recent.length < BURST_LIMIT) {
      recent.push(now);
      buckets.set(key, recent);
      return;
    }

    const waitMs = BURST_WINDOW_MS - (now - recent[0]) + 25;
    await sleep(waitMs);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Exponential backoff with jitter, so retrying instances do not resynchronise. */
function backoffMs(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader);
    if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds * 1000, 30_000);
  }
  const base = Math.min(1000 * 2 ** (attempt - 1), 15_000);
  return base + Math.floor(Math.random() * 400);
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

interface LogInput {
  workspaceId: string | null;
  operation: string;
  method: string;
  endpoint: string;
  requestSummary: unknown;
  statusCode: number | null;
  ok: boolean;
  responseSummary: unknown;
  error: string | null;
  durationMs: number;
  attempt: number;
  idempotencyKey?: string;
}

/** Trims payloads so the log stays useful without becoming a copy of the database. */
function summarize(value: unknown, maxLen = 2000): unknown {
  if (value == null) return null;
  try {
    const json = JSON.stringify(value);
    if (json.length <= maxLen) return JSON.parse(json);
    return { truncated: true, preview: json.slice(0, maxLen) };
  } catch {
    return { unserializable: true };
  }
}

async function writeLog(input: LogInput): Promise<void> {
  try {
    await adminDb().from('integration_logs').insert({
      workspace_id: input.workspaceId,
      provider: 'ghl',
      operation: input.operation,
      method: input.method,
      endpoint: input.endpoint,
      request_summary: summarize(input.requestSummary),
      status_code: input.statusCode,
      ok: input.ok,
      response_summary: summarize(input.responseSummary),
      error: input.error,
      duration_ms: input.durationMs,
      attempt: input.attempt,
      idempotency_key: input.idempotencyKey ?? null,
    });
  } catch (err) {
    console.error('[ghl] failed to write integration log', err);
  }
}

// ---------------------------------------------------------------------------
// Auth headers
// ---------------------------------------------------------------------------

/** Raised when a workspace has no sub-account credential stored yet. */
export class MissingLocationCredentialError extends GhlError {
  constructor(readonly locationId: string) {
    super(
      `No GoHighLevel token is stored for sub-account ${locationId}. Add the sub-account's ` +
        'Private Integration Token in the workspace settings before running this step.',
      0,
      null,
      'auth'
    );
    this.name = 'MissingLocationCredentialError';
  }
}

async function authHeaders(scope: GhlScope): Promise<{ headers: Record<string, string>; base: string }> {
  const mode = resolveAuthMode();

  if (scope.kind === 'v1') {
    if (!ghlAgencyKeyConfigured()) {
      throw new GhlError('This call requires GHL_AGENCY_API_KEY (v1 agency API).', 0, null, 'auth');
    }
    return {
      base: GHL_V1_BASE,
      headers: {
        Authorization: `Bearer ${process.env.GHL_AGENCY_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
  }

  const common = {
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Location scope: the workspace's own sub-account token comes first. This is the
  // model Selestial is built around — the agency credential creates sub-accounts, and
  // each workspace then holds its own PIT for everything inside its sub-account.
  if (scope.kind === 'location') {
    const credential = await resolveLocationCredential(scope.locationId);
    if (!credential) throw new MissingLocationCredentialError(scope.locationId);

    return {
      base: GHL_API_BASE,
      headers: { ...common, Authorization: `Bearer ${credential.token}` },
    };
  }

  // Agency scope: only ever used to create, read and list sub-accounts.
  if (!mode) {
    throw new GhlError(
      'GoHighLevel is not configured. Set GHL_CLIENT_ID/GHL_CLIENT_SECRET for agency OAuth, ' +
        'or GHL_PRIVATE_INTEGRATION_TOKEN for an agency-level Private Integration Token.',
      0,
      null,
      'auth'
    );
  }

  if (mode === 'oauth') {
    const token = await getAgencyToken();
    return {
      base: GHL_API_BASE,
      headers: { ...common, Authorization: `Bearer ${token.access_token}` },
    };
  }

  if (ghlPitConfigured()) {
    return {
      base: GHL_API_BASE,
      headers: { ...common, Authorization: `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}` },
    };
  }

  throw new GhlError(
    `Auth mode "${mode}" cannot serve an agency-scoped v2 call. Connect agency OAuth.`,
    0,
    null,
    'auth'
  );
}

function scopeKey(scope: GhlScope): string {
  return scope.kind === 'location' ? `loc:${scope.locationId}` : scope.kind;
}

// ---------------------------------------------------------------------------
// The single entry point every GHL call goes through
// ---------------------------------------------------------------------------

export async function ghlRequest<T = unknown>(options: GhlRequestOptions): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 4;
  const tolerate = options.tolerate ?? [];
  let lastError: GhlError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startedAt = Date.now();
    let endpoint = options.path;

    try {
      const { headers, base } = await authHeaders(options.scope);

      const url = new URL(options.path.replace(/^\//, ''), base.endsWith('/') ? base : `${base}/`);
      for (const [key, value] of Object.entries(options.query ?? {})) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
      }
      endpoint = url.pathname + url.search;

      await throttle(scopeKey(options.scope));

      const res = await fetch(url.toString(), {
        method: options.method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: 'no-store',
      });

      const text = await res.text();
      let parsed: unknown = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }

      const durationMs = Date.now() - startedAt;
      const ok = res.ok || tolerate.includes(res.status);

      await writeLog({
        workspaceId: options.workspaceId ?? null,
        operation: options.operation,
        method: options.method,
        endpoint,
        requestSummary: options.body ?? options.query ?? null,
        statusCode: res.status,
        ok,
        responseSummary: parsed,
        error: ok ? null : `HTTP ${res.status}`,
        durationMs,
        attempt,
        idempotencyKey: options.idempotencyKey,
      });

      if (ok) return parsed as T;

      // A location token can be revoked out from under us; drop it and let the
      // retry mint a fresh one before giving up.
      if (res.status === 401 && options.scope.kind === 'location') {
        await invalidateLocationToken(options.scope.locationId).catch(() => {});
      }

      const error = new GhlError(
        `GHL ${options.operation} failed with ${res.status}`,
        res.status,
        parsed,
        options.operation
      );

      const canRetry = error.retryable || (res.status === 401 && options.scope.kind === 'location');
      if (!canRetry || attempt === maxAttempts) throw error;

      lastError = error;
      await sleep(backoffMs(attempt, res.headers.get('retry-after')));
    } catch (err) {
      if (err instanceof GhlError) {
        if (attempt === maxAttempts || !err.retryable) throw err;
        lastError = err;
        continue;
      }

      // Network-level failure: log it, then retry on the same backoff schedule.
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);

      await writeLog({
        workspaceId: options.workspaceId ?? null,
        operation: options.operation,
        method: options.method,
        endpoint,
        requestSummary: options.body ?? options.query ?? null,
        statusCode: null,
        ok: false,
        responseSummary: null,
        error: message,
        durationMs,
        attempt,
        idempotencyKey: options.idempotencyKey,
      });

      lastError = new GhlError(`GHL ${options.operation} network error: ${message}`, 0, null, options.operation);
      if (attempt === maxAttempts) throw lastError;
      await sleep(backoffMs(attempt, null));
    }
  }

  throw lastError ?? new GhlError(`GHL ${options.operation} failed`, 0, null, options.operation);
}
