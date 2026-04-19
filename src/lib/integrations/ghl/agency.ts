/**
 * GoHighLevel Agency client.
 *
 * Uses the **agency API key** (a JWT minted from your GHL Agency Settings →
 * API Keys page). Distinct from the per-location PIT in `./client.ts`:
 *
 *   - Per-location PIT  →  acts inside a single sub-account (contacts,
 *                          conversations, opportunities, etc.)
 *   - Agency API key    →  acts at the agency level — create / list / delete
 *                          sub-accounts (locations), install snapshots,
 *                          create per-location API keys.
 *
 * Server-side only. Reads `GHL_AGENCY_API_KEY` from the environment. NEVER
 * import from a client component.
 *
 * Reference: https://highlevel.stoplight.io/docs/integrations/  (v1 Agency API)
 *
 * Endpoints used (v1, agency-level):
 *   POST   /v1/locations/                 → create sub-account
 *   GET    /v1/locations/                 → list sub-accounts
 *   GET    /v1/locations/{locationId}     → fetch one
 *   DELETE /v1/locations/{locationId}     → delete one
 *   POST   /v1/locations/{locationId}/api-key → mint an API key for that loc
 *
 * Snapshot install is handled at create-time via the `snapshot_id` field in
 * the create-location body.
 */

const DEFAULT_BASE_URL = 'https://rest.gohighlevel.com';

export type GhlAgencyClientOptions = {
  apiKey?: string;
  baseUrl?: string;
  companyId?: string;
};

export class GhlAgencyError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'GhlAgencyError';
    this.status = status;
    this.body = body;
  }
}

export interface CreateSubAccountInput {
  /** Display name for the new sub-account. */
  businessName: string;
  /** ISO 3166-1 alpha-2 country code, e.g. 'US'. Defaults to 'US'. */
  country?: string;
  /** Sub-account timezone (IANA), e.g. 'America/Chicago'. Defaults to UTC. */
  timezone?: string;
  /** Optional contact details prefilled on the new sub-account. */
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  /**
   * Optional snapshot ID to install during creation. Falls back to
   * `GHL_DEFAULT_SNAPSHOT_ID`.
   */
  snapshotId?: string;
  /** Optional pass-through of any additional GHL fields. */
  extra?: Record<string, unknown>;
}

export interface SubAccountSummary {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
}

export class GhlAgencyClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly companyId?: string;

  constructor(opts: GhlAgencyClientOptions = {}) {
    const apiKey = opts.apiKey ?? process.env.GHL_AGENCY_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GHL agency API key missing. Set GHL_AGENCY_API_KEY in your environment.'
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
    this.companyId = opts.companyId ?? process.env.GHL_AGENCY_COMPANY_ID;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>
  ): Promise<T> {
    const url = new URL(path.replace(/^\//, ''), this.baseUrl + '/');
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      throw new GhlAgencyError(
        `GHL agency ${method} ${path} failed: ${res.status} ${res.statusText}`,
        res.status,
        parsed
      );
    }

    return parsed as T;
  }

  /**
   * Create a new sub-account (location) under the agency. Optionally
   * installs a snapshot so the sub-account is born preconfigured with
   * workflows, pipelines, custom fields, calendars, etc.
   */
  async createSubAccount(input: CreateSubAccountInput): Promise<SubAccountSummary> {
    const snapshotId = input.snapshotId ?? process.env.GHL_DEFAULT_SNAPSHOT_ID;
    const payload: Record<string, unknown> = {
      businessName: input.businessName,
      country: input.country ?? 'US',
      timezone: input.timezone ?? 'America/Chicago',
      email: input.email,
      phone: input.phone,
      website: input.website,
      address: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      ...(snapshotId ? { snapshot_id: snapshotId } : {}),
      ...(input.extra ?? {}),
    };

    // Strip undefined fields so GHL's validator stays happy.
    for (const k of Object.keys(payload)) {
      if (payload[k] === undefined) delete payload[k];
    }

    const res = await this.request<{ id?: string; location?: SubAccountSummary }>(
      'POST',
      'v1/locations/',
      payload
    );
    const id = (res.location?.id ?? res.id) as string | undefined;
    if (!id) {
      throw new GhlAgencyError(
        'GHL did not return a location id after createSubAccount',
        500,
        res
      );
    }
    return { id, ...(res.location ?? {}) };
  }

  /** List sub-accounts the agency key can see. */
  async listSubAccounts(): Promise<SubAccountSummary[]> {
    const res = await this.request<{ locations?: SubAccountSummary[] }>(
      'GET',
      'v1/locations/'
    );
    return res.locations ?? [];
  }

  /** Fetch a single sub-account by id (verifies the key + the location). */
  async getSubAccount(locationId: string): Promise<SubAccountSummary> {
    return this.request<SubAccountSummary>('GET', `v1/locations/${locationId}`);
  }

  /** Delete a sub-account. Use carefully — this is irreversible in GHL. */
  async deleteSubAccount(locationId: string): Promise<void> {
    await this.request<unknown>('DELETE', `v1/locations/${locationId}`);
  }

  /**
   * Mint a per-location API key (legacy v1) for a freshly-created sub-account.
   * The returned `apiKey` is what Selestial then stores on `businesses` and
   * uses for all future per-tenant calls. Note: GHL is in the process of
   * deprecating v1 per-location API keys in favor of OAuth + PIT — when that
   * happens this method will switch to the equivalent v2 PIT flow.
   */
  async createLocationApiKey(locationId: string): Promise<{ apiKey: string }> {
    return this.request<{ apiKey: string }>('POST', `v1/locations/${locationId}/api-key`, {});
  }

  /** Returns the agency company id from the bearer JWT, if provided. */
  getCompanyId(): string | undefined {
    return this.companyId;
  }
}

let _agency: GhlAgencyClient | null = null;
export function getGhlAgencyClient(opts?: GhlAgencyClientOptions): GhlAgencyClient {
  if (!_agency) _agency = new GhlAgencyClient(opts);
  return _agency;
}

export function isGhlAgencyConfigured(): boolean {
  return Boolean(process.env.GHL_AGENCY_API_KEY);
}
