/**
 * Row types for the Selestial v2 tables.
 *
 * These are hand-written rather than generated because `src/integrations/supabase/types.ts`
 * reflects the v1 live schema and is regenerated from a database that predates v2. Keeping
 * v2 types here means v2 code is type-safe today and stays that way after the next
 * `supabase gen types` run overwrites the v1 file.
 */

export type WorkspaceStatus = 'onboarding' | 'active' | 'paused' | 'churned';
export type WorkspaceRole = 'agency_admin' | 'client_owner' | 'client_staff';
export type ProvisioningStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';
export type ContactStatus = 'active' | 'opted_out' | 'do_not_contact' | 'booked' | 'bounced';
export type OutreachChannel = 'sms' | 'email';
export type CampaignKind = 'reactivation' | 'winback' | 'referral' | 'review';
export type CampaignState =
  | 'draft'
  | 'generating'
  | 'ready'
  | 'launching'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed';
export type EnrollmentState = 'active' | 'completed' | 'exited' | 'suppressed';
export type OutreachMessageState =
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'skipped'
  | 'canceled';
export type ChannelMix = 'sms' | 'email' | 'both';

/** Every value `engagement_events.event_type` is allowed to take. */
export const EVENT_TYPES = [
  'contact_imported',
  'contact_merged',
  'message_scheduled',
  'message_sent',
  'message_delivered',
  'message_failed',
  'message_skipped',
  'email_opened',
  'link_clicked',
  'attachment_viewed',
  'attachment_view_duration',
  'reply_received',
  'booking_created',
  'opted_out',
  'email_bounced',
  'email_complained',
  'sequence_exited',
  'status_changed',
] as const;

export type EngagementEventType = (typeof EVENT_TYPES)[number];

export interface BusinessProfile {
  tone?: string;
  positioning?: string;
  offer?: string;
  notes?: string;
  averageTicket?: string;
  differentiators?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  ghl_location_id: string | null;
  ghl_metadata: Record<string, unknown>;
  ghl_custom_fields: Record<string, string>;
  ghl_connected_at: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  timezone: string;
  service_area: string | null;
  service_types: string[];
  business_profile: BusinessProfile;
  physical_address: string | null;
  booking_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
}

export interface ProvisioningStep {
  id: string;
  workspace_id: string;
  step_key: string;
  label: string;
  position: number;
  status: ProvisioningStatus;
  attempts: number;
  result: Record<string, unknown> | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface SendingIdentity {
  id: string;
  workspace_id: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  domain: string | null;
  resend_domain_id: string | null;
  dkim_status: string;
  verified: boolean;
  is_shared_domain: boolean;
}

export interface Contact {
  id: string;
  workspace_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  phone_raw: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  timezone: string | null;
  last_service_date: string | null;
  service_type: string | null;
  lifetime_value_cents: number | null;
  source_list_id: string | null;
  imported_notes: string | null;
  custom_fields: Record<string, unknown>;
  status: ContactStatus;
  opted_out_at: string | null;
  opted_out_channel: string | null;
  opted_out_reason: string | null;
  do_not_contact: boolean;
  booked_at: string | null;
  email_bounced_at: string | null;
  engagement_score: number;
  engagement_tier: string;
  last_engagement_at: string | null;
  last_contacted_at: string | null;
  ai_summary: string | null;
  ai_summary_updated_at: string | null;
  ai_summary_stale: boolean;
  ghl_contact_id: string | null;
  ghl_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactList {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  name: string;
  source_filename: string | null;
  status: string;
  column_mapping: Record<string, string>;
  stats: ImportStats;
  imported_by: string | null;
  created_at: string;
}

export interface ImportStats {
  rows?: number;
  imported?: number;
  merged?: number;
  rejected?: number;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  kind: CampaignKind;
  status: CampaignState;
  channel_mix: ChannelMix;
  send_window_start: number;
  send_window_end: number;
  send_days: number[];
  daily_cap: number;
  drip_spacing_hours: number;
  sequence_version: number;
  generation_meta: GenerationMeta;
  generation_error: string | null;
  offer: string | null;
  booking_url: string | null;
  launched_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationMeta {
  model?: string;
  promptVersion?: string;
  angle?: string;
  generatedAt?: string;
  touchCount?: number;
  spanDays?: number;
  fallback?: boolean;
}

export interface CampaignTouch {
  id: string;
  workspace_id: string;
  campaign_id: string;
  version: number;
  step_index: number;
  channel: OutreachChannel;
  delay_hours: number;
  angle: string | null;
  subject_template: string | null;
  body_template: string;
  link_kind: 'booking' | 'offer' | 'attachment' | null;
  attachment_id: string | null;
  include_optout: boolean;
  generated_by: Record<string, unknown>;
  created_at: string;
}

export interface CampaignEnrollment {
  id: string;
  workspace_id: string;
  campaign_id: string;
  contact_id: string;
  status: EnrollmentState;
  current_step: number;
  sequence_version: number;
  enrolled_at: string;
  exited_at: string | null;
  exit_reason: string | null;
}

export interface OutreachMessage {
  id: string;
  workspace_id: string;
  campaign_id: string;
  enrollment_id: string;
  contact_id: string;
  touch_id: string | null;
  step_index: number;
  channel: OutreachChannel;
  status: OutreachMessageState;
  scheduled_for: string;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  subject: string | null;
  body: string | null;
  to_address: string | null;
  from_address: string | null;
  template_version: number;
  render_meta: Record<string, unknown>;
  provider: string | null;
  provider_message_id: string | null;
  attempts: number;
  error: string | null;
  skip_reason: string | null;
  idempotency_key: string;
  created_at: string;
}

export interface CampaignAttachment {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  name: string;
  description: string | null;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface TrackedLink {
  id: string;
  token: string;
  workspace_id: string;
  contact_id: string | null;
  campaign_id: string | null;
  message_id: string | null;
  touch_id: string | null;
  kind: 'url' | 'attachment' | 'unsubscribe';
  destination_url: string | null;
  attachment_id: string | null;
  label: string | null;
  click_count: number;
  first_clicked_at: string | null;
  last_clicked_at: string | null;
  expires_at: string | null;
}

export interface EngagementEvent {
  id: number;
  workspace_id: string;
  contact_id: string | null;
  campaign_id: string | null;
  message_id: string | null;
  touch_id: string | null;
  link_id: string | null;
  event_type: EngagementEventType;
  channel: OutreachChannel | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
  provider: string | null;
  provider_event_id: string | null;
}

export interface ContactNote {
  id: number;
  workspace_id: string;
  contact_id: string;
  kind: 'user' | 'system';
  body: string;
  author_id: string | null;
  created_at: string;
}

export interface WorkspaceActivity {
  id: number;
  workspace_id: string | null;
  actor_type: 'user' | 'system' | 'webhook';
  actor_id: string | null;
  actor_label: string | null;
  action: string;
  summary: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InboundWebhook {
  id: string;
  provider: string;
  event_type: string | null;
  workspace_id: string | null;
  signature_verified: boolean;
  status: 'received' | 'processed' | 'failed' | 'dead_letter' | 'ignored';
  attempts: number;
  error: string | null;
  raw: Record<string, unknown>;
  headers: Record<string, unknown>;
  dedupe_key: string | null;
  received_at: string;
  processed_at: string | null;
}

export interface WeekStats {
  sms_sent: number;
  email_sent: number;
  scheduled: number;
  delivered: number;
  opens: number;
  clicks: number;
  unique_clickers: number;
  attachment_views: number;
  replies: number;
  bookings: number;
  opt_outs: number;
  failures: number;
}

export const EMPTY_WEEK_STATS: WeekStats = {
  sms_sent: 0,
  email_sent: 0,
  scheduled: 0,
  delivered: 0,
  opens: 0,
  clicks: 0,
  unique_clickers: 0,
  attachment_views: 0,
  replies: 0,
  bookings: 0,
  opt_outs: 0,
  failures: 0,
};
