import 'server-only';

import { GHL_API_BASE, GHL_API_VERSION, resolveAuthMode } from './config';
import { getAgencyToken, resolveLocationCredential } from './tokens';

/**
 * Live capability check against the GoHighLevel API.
 *
 * Written because a token can authenticate perfectly and still be useless: a Private
 * Integration Token issued with only `locations.readonly` lists sub-accounts happily and
 * then 401s on every contact, tag and conversation call. Without this, that shows up as
 * a provisioning step failing days later with a message nobody connects to scopes.
 *
 * Each probe is a cheap read that exercises the same scope the corresponding write needs,
 * so it can be run safely at any time.
 */

export interface CapabilityResult {
  key: string;
  label: string;
  /** What stops working when this scope is missing. */
  impact: string;
  scope: string;
  ok: boolean;
  status: number;
  detail?: string;
}

export interface PreflightResult {
  authMode: string | null;
  locationId: string | null;
  capabilities: CapabilityResult[];
  missingScopes: string[];
  ready: boolean;
  error?: string;
}

interface Probe {
  key: string;
  label: string;
  impact: string;
  scope: string;
  path: (locationId: string) => string;
  /** Agency-scoped probes do not need a location token. */
  agencyScoped?: boolean;
}

const PROBES: Probe[] = [
  {
    key: 'locations',
    label: 'List sub-accounts',
    impact: 'Onboarding cannot create or connect a sub-account',
    scope: 'locations.readonly / locations.write',
    path: () => '/locations/search?limit=1',
    agencyScoped: true,
  },
  {
    key: 'customFields',
    label: 'Read and write custom fields',
    impact: 'Provisioning cannot create the Selestial fields',
    scope: 'locations/customFields.readonly + .write',
    path: (id) => `/locations/${id}/customFields`,
  },
  {
    key: 'tags',
    label: 'Read and write tags',
    impact: 'Engagement tags never reach the client’s automations',
    scope: 'locations/tags.readonly + .write',
    path: (id) => `/locations/${id}/tags`,
  },
  {
    key: 'contacts',
    label: 'Read and write contacts',
    impact: 'Imported contacts are never mirrored, so SMS cannot be sent',
    scope: 'contacts.readonly + contacts.write',
    path: (id) => `/contacts/?locationId=${id}&limit=1`,
  },
  {
    key: 'conversations',
    label: 'Send messages',
    impact: 'No SMS can be sent at all',
    scope: 'conversations.readonly + conversations/message.write',
    path: (id) => `/conversations/search?locationId=${id}&limit=1`,
  },
];

/** Scopes whose absence stops the core loop rather than just degrading it. */
const CRITICAL = new Set(['contacts', 'conversations']);

async function authHeader(
  agencyScoped: boolean,
  locationId: string,
  overrideToken?: string
): Promise<string | null> {
  // Location scope: an explicit token when we are testing one before saving it,
  // otherwise whatever is stored for this sub-account.
  if (!agencyScoped) {
    if (overrideToken) return `Bearer ${overrideToken.trim()}`;
    const credential = await resolveLocationCredential(locationId);
    return credential ? `Bearer ${credential.token}` : null;
  }

  const mode = resolveAuthMode();
  if (!mode) return null;
  if (mode === 'oauth') return `Bearer ${(await getAgencyToken()).access_token}`;
  if (process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
    return `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`;
  }
  return null;
}

/**
 * @param locationId    the sub-account to probe, or null to test agency scope only
 * @param overrideToken a candidate sub-account token to test before storing it
 */
export async function runGhlPreflight(
  locationId: string | null,
  overrideToken?: string
): Promise<PreflightResult> {
  const authMode = resolveAuthMode();

  if (!authMode && !overrideToken) {
    return {
      authMode: null,
      locationId,
      capabilities: [],
      missingScopes: [],
      ready: false,
      error: 'GoHighLevel is not configured. Connect the agency or set a token first.',
    };
  }

  const capabilities: CapabilityResult[] = [];

  for (const probe of PROBES) {
    // Location-scoped probes need something to probe against.
    if (!probe.agencyScoped && !locationId) {
      capabilities.push({
        key: probe.key,
        label: probe.label,
        impact: probe.impact,
        scope: probe.scope,
        ok: false,
        status: 0,
        detail: 'Skipped — no sub-account to test against yet',
      });
      continue;
    }

    try {
      const header = await authHeader(
        probe.agencyScoped ?? false,
        locationId ?? '',
        probe.agencyScoped ? undefined : overrideToken
      );

      if (!header) {
        capabilities.push({
          key: probe.key,
          label: probe.label,
          impact: probe.impact,
          scope: probe.scope,
          ok: false,
          status: 0,
          detail: probe.agencyScoped
            ? `Auth mode "${authMode ?? 'none'}" cannot reach this endpoint`
            : 'No sub-account token stored for this workspace yet',
        });
        continue;
      }

      const response = await fetch(`${GHL_API_BASE}${probe.path(locationId ?? '')}`, {
        method: 'GET',
        headers: {
          Authorization: header,
          Version: GHL_API_VERSION,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      let detail: string | undefined;
      if (!response.ok) {
        const text = await response.text();
        try {
          detail = (JSON.parse(text) as { message?: string }).message ?? text.slice(0, 160);
        } catch {
          detail = text.slice(0, 160);
        }
      }

      capabilities.push({
        key: probe.key,
        label: probe.label,
        impact: probe.impact,
        scope: probe.scope,
        // 404 means the scope was granted and the resource simply is not there.
        ok: response.ok || response.status === 404,
        status: response.status,
        detail,
      });
    } catch (err) {
      capabilities.push({
        key: probe.key,
        label: probe.label,
        impact: probe.impact,
        scope: probe.scope,
        ok: false,
        status: 0,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const missingScopes = capabilities.filter((c) => !c.ok).map((c) => c.scope);
  const criticalMissing = capabilities.some((c) => !c.ok && CRITICAL.has(c.key));

  return {
    authMode,
    locationId,
    capabilities,
    missingScopes,
    ready: !criticalMissing,
  };
}
