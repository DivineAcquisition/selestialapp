import 'server-only';

/**
 * How the GHL module authenticates. Selestial prefers agency OAuth; the two key-based
 * modes exist so an install that already has v1 keys keeps working while OAuth is set up.
 *
 *  - `oauth`       agency-level OAuth. Agency token for company-scoped calls, per-location
 *                  tokens minted on demand for location-scoped calls. The target state.
 *  - `agency_key`  legacy v1 agency API key. Only supports sub-account CRUD.
 *  - `pit`         a single Private Integration Token. Location-scoped calls only, and
 *                  only against the one sub-account the token belongs to.
 */
export type GhlAuthMode = 'oauth' | 'agency_key' | 'pit';

export const GHL_API_BASE = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
export const GHL_API_VERSION = process.env.GHL_API_VERSION || '2021-07-28';
export const GHL_V1_BASE = process.env.GHL_V1_API_BASE_URL || 'https://rest.gohighlevel.com';
export const GHL_MARKETPLACE_BASE =
  process.env.GHL_MARKETPLACE_URL || 'https://marketplace.gohighlevel.com';

/** Scopes the agency OAuth app needs for everything Selestial does. */
export const GHL_OAUTH_SCOPES = [
  'locations.readonly',
  'locations.write',
  'locations/customFields.readonly',
  'locations/customFields.write',
  'locations/tags.readonly',
  'locations/tags.write',
  'contacts.readonly',
  'contacts.write',
  'conversations.readonly',
  'conversations.write',
  'conversations/message.readonly',
  'conversations/message.write',
  'opportunities.readonly',
  'calendars/events.readonly',
  'users.readonly',
].join(' ');

export function ghlOAuthConfigured(): boolean {
  return Boolean(process.env.GHL_CLIENT_ID && process.env.GHL_CLIENT_SECRET);
}

export function ghlAgencyKeyConfigured(): boolean {
  return Boolean(process.env.GHL_AGENCY_API_KEY);
}

export function ghlPitConfigured(): boolean {
  return Boolean(process.env.GHL_PRIVATE_INTEGRATION_TOKEN);
}

export function resolveAuthMode(): GhlAuthMode | null {
  if (ghlOAuthConfigured()) return 'oauth';
  if (ghlAgencyKeyConfigured()) return 'agency_key';
  if (ghlPitConfigured()) return 'pit';
  return null;
}

export function isGhlConfigured(): boolean {
  return resolveAuthMode() !== null;
}

export function ghlRedirectUri(): string {
  return (
    process.env.GHL_OAUTH_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ghl/oauth/callback`
  );
}

/**
 * The custom fields Selestial provisions into every sub-account. The key is Selestial's
 * stable identifier; `workspaces.ghl_custom_fields` maps it to the GHL field id.
 */
export const SELESTIAL_CUSTOM_FIELDS = [
  {
    key: 'selestial_reactivation_status',
    name: 'Selestial Reactivation Status',
    dataType: 'TEXT',
  },
  { key: 'selestial_last_service_date', name: 'Selestial Last Service Date', dataType: 'DATE' },
  { key: 'selestial_engagement_score', name: 'Selestial Engagement Score', dataType: 'NUMERICAL' },
  { key: 'selestial_contact_id', name: 'Selestial Contact ID', dataType: 'TEXT' },
] as const;

export type SelestialCustomFieldKey = (typeof SELESTIAL_CUSTOM_FIELDS)[number]['key'];

/** The tag taxonomy mirrored into every sub-account so client automations can react. */
export const SELESTIAL_TAGS = {
  uploaded: 'selestial:uploaded',
  contacted: 'selestial:contacted',
  clicked: 'selestial:clicked',
  replied: 'selestial:replied',
  booked: 'selestial:booked',
  optedOut: 'selestial:opted-out',
} as const;

export const SELESTIAL_TAG_LIST = Object.values(SELESTIAL_TAGS);

/** Inbound GHL events Selestial expects to receive. */
export const GHL_WEBHOOK_EVENTS = [
  'InboundMessage',
  'OutboundMessage',
  'ContactCreate',
  'ContactUpdate',
  'ContactDelete',
  'AppointmentCreate',
  'AppointmentUpdate',
  'OpportunityCreate',
] as const;
