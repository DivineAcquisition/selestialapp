/**
 * GoHighLevel (GHL) Private Integration Token client.
 *
 * Selestial uses GHL during onboarding to sync contacts, opportunities, and
 * SMS/email conversations from the customer's GHL sub-account into our
 * speed-to-lead and re-engagement sequences.
 *
 * The PIT (Private Integration Token) is read from the environment variable
 * `GHL_PRIVATE_INTEGRATION_TOKEN`. NEVER hardcode tokens in the repo.
 *
 * To configure on Vercel / locally, add to `.env.local`:
 *   GHL_PRIVATE_INTEGRATION_TOKEN=pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *   GHL_API_VERSION=2021-07-28
 *   GHL_API_BASE_URL=https://services.leadconnectorhq.com
 */

const DEFAULT_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_API_VERSION = "2021-07-28";

export type GhlClientOptions = {
  token?: string;
  baseUrl?: string;
  apiVersion?: string;
  locationId?: string;
};

export class GhlError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "GhlError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Returns true if a GHL token is configured in the environment.
 * Safe to call from server code only.
 */
export function isGhlConfigured(): boolean {
  return Boolean(process.env.GHL_PRIVATE_INTEGRATION_TOKEN);
}

/**
 * Lightweight typed wrapper around GHL's REST API.
 * Server-side only — never import from a client component.
 */
export class GhlClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly locationId?: string;

  constructor(opts: GhlClientOptions = {}) {
    const token = opts.token ?? process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
    if (!token) {
      throw new Error(
        "GHL token missing. Set GHL_PRIVATE_INTEGRATION_TOKEN in your environment."
      );
    }
    this.token = token;
    this.baseUrl = opts.baseUrl ?? process.env.GHL_API_BASE_URL ?? DEFAULT_BASE_URL;
    this.apiVersion = opts.apiVersion ?? process.env.GHL_API_VERSION ?? DEFAULT_API_VERSION;
    this.locationId = opts.locationId ?? process.env.GHL_LOCATION_ID;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>
  ): Promise<T> {
    const url = new URL(path.replace(/^\//, ""), this.baseUrl + "/");
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Version: this.apiVersion,
      },
      body: body ? JSON.stringify(body) : undefined,
      // GHL rate limits aggressively; let the caller handle retries if needed.
      cache: "no-store",
    });

    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      throw new GhlError(
        `GHL ${method} ${path} failed: ${res.status} ${res.statusText}`,
        res.status,
        parsed
      );
    }

    return parsed as T;
  }

  /** GET /locations/{locationId} — verify the token is valid for this location. */
  async getLocation(locationId?: string) {
    const id = locationId ?? this.locationId;
    if (!id) throw new Error("locationId is required (pass it or set GHL_LOCATION_ID)");
    return this.request<{ location: unknown }>("GET", `locations/${id}`);
  }

  /** POST /contacts/ — upsert a contact for speed-to-lead routing. */
  async upsertContact(input: {
    locationId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    source?: string;
    tags?: string[];
    customFields?: Array<{ id: string; value: string | number | boolean }>;
  }) {
    const locationId = input.locationId ?? this.locationId;
    if (!locationId) throw new Error("locationId is required for upsertContact");
    return this.request<{ contact: { id: string } }>("POST", "contacts/upsert", {
      ...input,
      locationId,
    });
  }

  /** POST /conversations/messages — send an outbound SMS or Email through GHL. */
  async sendMessage(input: {
    type: "SMS" | "Email";
    contactId: string;
    message?: string;
    subject?: string;
    html?: string;
  }) {
    return this.request<{ messageId: string }>("POST", "conversations/messages", input);
  }
}

/**
 * Returns a singleton GHL client (lazy-initialized) for server use.
 */
let _client: GhlClient | null = null;
export function getGhlClient(opts?: GhlClientOptions): GhlClient {
  if (!_client) _client = new GhlClient(opts);
  return _client;
}
