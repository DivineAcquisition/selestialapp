import 'server-only';

import {
  GHL_WEBHOOK_EVENTS,
  SELESTIAL_CUSTOM_FIELDS,
  SELESTIAL_TAG_LIST,
  ghlAgencyKeyConfigured,
  resolveAuthMode,
} from './config';
import { ghlRequest, GhlError } from './http';

export { GhlError };

export interface CreateLocationInput {
  businessName: string;
  email?: string;
  phone?: string;
  website?: string;
  timezone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  snapshotId?: string;
}

export interface LocationSummary {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  timezone?: string;
  address?: string;
}

export interface UpsertContactInput {
  locationId: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  timezone?: string | null;
  tags?: string[];
  source?: string;
  /** GHL custom field id -> value. */
  customFields?: { id: string; value: string | number }[];
  workspaceId?: string;
}

export interface CustomFieldSummary {
  id: string;
  name: string;
  fieldKey?: string;
  dataType?: string;
}

/**
 * Every GHL call in Selestial goes through this class. Rate limiting, retries, token
 * refresh and integration logging all live in `ghlRequest`, so nothing else in the
 * codebase should ever `fetch` GoHighLevel directly.
 */
export class GhlClient {
  constructor(private readonly workspaceId?: string | null) {}

  // -------------------------------------------------------------------------
  // Sub-accounts (locations)
  // -------------------------------------------------------------------------

  async createLocation(input: CreateLocationInput): Promise<LocationSummary> {
    const body: Record<string, unknown> = {
      name: input.businessName,
      companyId: process.env.GHL_AGENCY_COMPANY_ID,
      email: input.email,
      phone: input.phone,
      website: input.website,
      timezone: input.timezone || 'America/Chicago',
      address: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country || 'US',
    };

    const snapshotId = input.snapshotId || process.env.GHL_DEFAULT_SNAPSHOT_ID;
    if (snapshotId) {
      body.snapshotId = snapshotId;
      // The v1 API spells the same field differently; harmless on v2.
      body.snapshot_id = snapshotId;
    }

    for (const key of Object.keys(body)) {
      if (body[key] === undefined || body[key] === null || body[key] === '') delete body[key];
    }

    // OAuth speaks v2; a legacy agency key can only reach the v1 endpoint.
    const useV1 = resolveAuthMode() === 'agency_key';
    const res = await ghlRequest<Record<string, unknown>>({
      operation: 'locations.create',
      method: 'POST',
      path: useV1 ? '/v1/locations/' : '/locations/',
      scope: useV1 ? { kind: 'v1' } : { kind: 'agency' },
      body,
      workspaceId: this.workspaceId,
    });

    const location = normalizeLocation(res);
    if (!location?.id) {
      throw new GhlError('GHL created a location but returned no id', 500, res, 'locations.create');
    }
    return location;
  }

  async getLocation(locationId: string): Promise<LocationSummary | null> {
    const useV1 = resolveAuthMode() === 'agency_key';
    const res = await ghlRequest<Record<string, unknown>>({
      operation: 'locations.get',
      method: 'GET',
      path: useV1 ? `/v1/locations/${locationId}` : `/locations/${locationId}`,
      scope: useV1 ? { kind: 'v1' } : { kind: 'agency' },
      workspaceId: this.workspaceId,
      tolerate: [404],
    });
    return normalizeLocation(res);
  }

  /** Sub-accounts under the agency, for the "connect existing" onboarding path. */
  async listLocations(): Promise<LocationSummary[]> {
    if (resolveAuthMode() === 'agency_key' || ghlAgencyKeyConfigured()) {
      const res = await ghlRequest<{ locations?: Record<string, unknown>[] }>({
        operation: 'locations.list',
        method: 'GET',
        path: '/v1/locations/',
        scope: { kind: 'v1' },
        workspaceId: this.workspaceId,
      });
      return (res?.locations ?? []).map(normalizeLocation).filter(isLocation);
    }

    const res = await ghlRequest<{ locations?: Record<string, unknown>[] }>({
      operation: 'locations.search',
      method: 'GET',
      path: '/locations/search',
      scope: { kind: 'agency' },
      query: { companyId: process.env.GHL_AGENCY_COMPANY_ID, limit: 200 },
      workspaceId: this.workspaceId,
    });
    return (res?.locations ?? []).map(normalizeLocation).filter(isLocation);
  }

  // -------------------------------------------------------------------------
  // Custom fields
  // -------------------------------------------------------------------------

  async listCustomFields(locationId: string): Promise<CustomFieldSummary[]> {
    const res = await ghlRequest<{ customFields?: CustomFieldSummary[] }>({
      operation: 'customFields.list',
      method: 'GET',
      path: `/locations/${locationId}/customFields`,
      scope: { kind: 'location', locationId },
      query: { model: 'contact' },
      workspaceId: this.workspaceId,
    });
    return res?.customFields ?? [];
  }

  async createCustomField(
    locationId: string,
    field: { name: string; dataType: string }
  ): Promise<CustomFieldSummary | null> {
    const res = await ghlRequest<{ customField?: CustomFieldSummary }>({
      operation: 'customFields.create',
      method: 'POST',
      path: `/locations/${locationId}/customFields`,
      scope: { kind: 'location', locationId },
      body: { name: field.name, dataType: field.dataType, model: 'contact' },
      workspaceId: this.workspaceId,
      tolerate: [400, 409],
    });
    return res?.customField ?? null;
  }

  /**
   * Creates any Selestial custom field the sub-account is missing and returns the full
   * `our key -> GHL field id` map. Safe to run repeatedly: existing fields are matched
   * by name and reused.
   */
  async ensureCustomFields(locationId: string): Promise<Record<string, string>> {
    const existing = await this.listCustomFields(locationId);
    const byName = new Map(existing.map((f) => [normalizeName(f.name), f.id]));
    const map: Record<string, string> = {};

    for (const field of SELESTIAL_CUSTOM_FIELDS) {
      const found = byName.get(normalizeName(field.name));
      if (found) {
        map[field.key] = found;
        continue;
      }

      const created = await this.createCustomField(locationId, {
        name: field.name,
        dataType: field.dataType,
      });

      if (created?.id) {
        map[field.key] = created.id;
      } else {
        // Creation was tolerated (already exists under a slightly different shape).
        // Re-read so a retry of this step converges instead of looping forever.
        const refreshed = await this.listCustomFields(locationId);
        const match = refreshed.find((f) => normalizeName(f.name) === normalizeName(field.name));
        if (match) map[field.key] = match.id;
      }
    }

    return map;
  }

  // -------------------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------------------

  async ensureTags(locationId: string): Promise<string[]> {
    const created: string[] = [];

    for (const name of SELESTIAL_TAG_LIST) {
      await ghlRequest({
        operation: 'tags.create',
        method: 'POST',
        path: `/locations/${locationId}/tags`,
        scope: { kind: 'location', locationId },
        body: { name },
        workspaceId: this.workspaceId,
        // GHL rejects duplicates with a 4xx; for provisioning that is the desired state.
        tolerate: [400, 409, 422],
      });
      created.push(name);
    }

    return created;
  }

  async addContactTags(locationId: string, contactId: string, tags: string[]): Promise<void> {
    if (tags.length === 0) return;
    await ghlRequest({
      operation: 'contacts.addTags',
      method: 'POST',
      path: `/contacts/${contactId}/tags`,
      scope: { kind: 'location', locationId },
      body: { tags },
      workspaceId: this.workspaceId,
      tolerate: [404],
    });
  }

  async removeContactTags(locationId: string, contactId: string, tags: string[]): Promise<void> {
    if (tags.length === 0) return;
    await ghlRequest({
      operation: 'contacts.removeTags',
      method: 'DELETE',
      path: `/contacts/${contactId}/tags`,
      scope: { kind: 'location', locationId },
      body: { tags },
      workspaceId: this.workspaceId,
      tolerate: [404],
    });
  }

  // -------------------------------------------------------------------------
  // Contacts
  // -------------------------------------------------------------------------

  async upsertContact(input: UpsertContactInput): Promise<{ id: string } | null> {
    const body: Record<string, unknown> = {
      locationId: input.locationId,
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      name: input.name ?? undefined,
      email: input.email ?? undefined,
      phone: input.phone ?? undefined,
      address1: input.address1 ?? undefined,
      city: input.city ?? undefined,
      state: input.state ?? undefined,
      postalCode: input.postalCode ?? undefined,
      timezone: input.timezone ?? undefined,
      tags: input.tags?.length ? input.tags : undefined,
      source: input.source ?? 'Selestial',
      customFields: input.customFields?.length ? input.customFields : undefined,
    };

    for (const key of Object.keys(body)) {
      if (body[key] === undefined) delete body[key];
    }

    const res = await ghlRequest<{ contact?: { id?: string }; id?: string }>({
      operation: 'contacts.upsert',
      method: 'POST',
      path: '/contacts/upsert',
      scope: { kind: 'location', locationId: input.locationId },
      body,
      workspaceId: input.workspaceId ?? this.workspaceId,
    });

    const id = res?.contact?.id ?? res?.id;
    return id ? { id } : null;
  }

  // -------------------------------------------------------------------------
  // Conversations / SMS
  // -------------------------------------------------------------------------

  /**
   * Sends an SMS through the client's own sub-account, which is the whole point: the
   * reply lands in the inbox they already use and comes back to us over webhooks.
   */
  async sendSms(params: {
    locationId: string;
    contactId: string;
    message: string;
    idempotencyKey?: string;
  }): Promise<{ messageId: string | null; conversationId: string | null }> {
    const res = await ghlRequest<{
      messageId?: string;
      messageIds?: string[];
      conversationId?: string;
    }>({
      operation: 'conversations.sendSms',
      method: 'POST',
      path: '/conversations/messages',
      scope: { kind: 'location', locationId: params.locationId },
      body: {
        type: 'SMS',
        contactId: params.contactId,
        message: params.message,
      },
      workspaceId: this.workspaceId,
      idempotencyKey: params.idempotencyKey,
      // A send is not safe to blind-retry; one attempt, then surface the failure and
      // let the dispatcher decide using our own idempotency key.
      maxAttempts: 1,
    });

    return {
      messageId: res?.messageId ?? res?.messageIds?.[0] ?? null,
      conversationId: res?.conversationId ?? null,
    };
  }

  // -------------------------------------------------------------------------
  // Webhooks
  // -------------------------------------------------------------------------

  /**
   * GoHighLevel delivers v2 webhooks through the marketplace app subscription rather
   * than a per-location API, so there is nothing to POST here. This reports what the
   * app must be subscribed to and whether the operator has confirmed it, which is what
   * the provisioning step records and the docs explain how to satisfy.
   */
  describeWebhookRequirements(): {
    url: string;
    events: readonly string[];
    appConfigured: boolean;
  } {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.selestial.io';
    return {
      url: `${appUrl}/api/webhooks/ghl`,
      events: GHL_WEBHOOK_EVENTS,
      appConfigured: process.env.GHL_WEBHOOK_APP_CONFIGURED === 'true',
    };
  }
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function isLocation(value: LocationSummary | null): value is LocationSummary {
  return Boolean(value?.id);
}

function normalizeLocation(raw: unknown): LocationSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const inner = (record.location ?? record) as Record<string, unknown>;

  const id = (inner.id ?? inner._id ?? inner.locationId) as string | undefined;
  if (!id) return null;

  return {
    id,
    name: inner.name as string | undefined,
    email: inner.email as string | undefined,
    phone: inner.phone as string | undefined,
    website: inner.website as string | undefined,
    timezone: inner.timezone as string | undefined,
    address: (inner.address ?? inner.address1) as string | undefined,
  };
}

export function ghl(workspaceId?: string | null): GhlClient {
  return new GhlClient(workspaceId);
}
