import 'server-only';

import { Resend } from 'resend';

import { adminDb } from './db';
import type { SendingIdentity, Workspace } from './types';

/**
 * Sending pattern: one shared, agency-owned sending domain with a per-client from-name
 * and the client's own address as reply-to.
 *
 *   Sparkle Clean Co <sparkle-clean-co@mail.selestial.io>   reply-to: owner@sparkleclean.com
 *
 * Chosen over a subdomain per client because it needs exactly one SPF/DKIM/DMARC setup
 * that we control, so onboarding a client never blocks on their DNS, and reputation is
 * managed in one place. A client who wants their own domain can still have one: set
 * `domain` on their sending identity and verify it in Resend, and this module will use it
 * without any other change. The DNS guidance is in `src/content/docs/email-sending.md`.
 */
export const SHARED_SENDING_DOMAIN = process.env.SELESTIAL_SENDING_DOMAIN || 'mail.selestial.io';

const PLATFORM_FROM = process.env.SELESTIAL_PLATFORM_FROM || 'Selestial <hello@selestial.io>';

let cachedResend: Resend | null = null;

function resendClient(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

export function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key) && key !== 're_xxx';
}

interface SendResult {
  ok: boolean;
  id: string | null;
  error: string | null;
}

async function logResend(input: {
  workspaceId: string | null;
  operation: string;
  ok: boolean;
  statusCode: number | null;
  request: unknown;
  response: unknown;
  error: string | null;
  durationMs: number;
  idempotencyKey?: string;
}): Promise<void> {
  try {
    await adminDb().from('integration_logs').insert({
      workspace_id: input.workspaceId,
      provider: 'resend',
      operation: input.operation,
      method: 'POST',
      endpoint: '/emails',
      request_summary: input.request,
      status_code: input.statusCode,
      ok: input.ok,
      response_summary: input.response,
      error: input.error,
      duration_ms: input.durationMs,
      idempotency_key: input.idempotencyKey ?? null,
    });
  } catch (err) {
    console.error('[email] failed to write integration log', err);
  }
}

async function deliver(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  workspaceId: string | null;
  operation: string;
  idempotencyKey?: string;
}): Promise<SendResult> {
  const client = resendClient();
  const startedAt = Date.now();

  if (!client) {
    await logResend({
      workspaceId: params.workspaceId,
      operation: params.operation,
      ok: false,
      statusCode: null,
      request: { to: params.to, subject: params.subject },
      response: null,
      error: 'RESEND_API_KEY is not configured',
      durationMs: 0,
      idempotencyKey: params.idempotencyKey,
    });
    return { ok: false, id: null, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const { data, error } = await client.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      headers: params.headers,
    });

    const durationMs = Date.now() - startedAt;

    await logResend({
      workspaceId: params.workspaceId,
      operation: params.operation,
      ok: !error,
      statusCode: error ? 400 : 200,
      request: { to: params.to, from: params.from, subject: params.subject },
      response: error ? { error } : { id: data?.id },
      error: error ? error.message : null,
      durationMs,
      idempotencyKey: params.idempotencyKey,
    });

    if (error) return { ok: false, id: null, error: error.message };
    return { ok: true, id: data?.id ?? null, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logResend({
      workspaceId: params.workspaceId,
      operation: params.operation,
      ok: false,
      statusCode: null,
      request: { to: params.to, subject: params.subject },
      response: null,
      error: message,
      durationMs: Date.now() - startedAt,
      idempotencyKey: params.idempotencyKey,
    });
    return { ok: false, id: null, error: message };
  }
}

/** Selestial's own transactional mail (invites, operator notifications). */
export async function sendPlatformEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  workspaceId?: string | null;
  operation?: string;
}): Promise<boolean> {
  const result = await deliver({
    from: PLATFORM_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    workspaceId: params.workspaceId ?? null,
    operation: `platform.${params.operation ?? 'email'}`,
  });
  return result.ok;
}

// ---------------------------------------------------------------------------
// Per-workspace sending identity
// ---------------------------------------------------------------------------

function localPartFor(workspace: Workspace): string {
  const slug = workspace.slug.replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'client';
  return slug;
}

export async function getSendingIdentity(workspace: Workspace): Promise<SendingIdentity> {
  const db = adminDb();

  const { data: existing } = await db
    .from('sending_identities')
    .select('*')
    .eq('workspace_id', workspace.id)
    .maybeSingle();

  if (existing) return existing as SendingIdentity;

  const row = {
    workspace_id: workspace.id,
    from_name: workspace.name,
    from_email: `${localPartFor(workspace)}@${SHARED_SENDING_DOMAIN}`,
    reply_to: workspace.email,
    domain: SHARED_SENDING_DOMAIN,
    is_shared_domain: true,
    // The shared domain is verified once at the agency level, so a workspace on it is
    // ready to send the moment it is created.
    verified: true,
    dkim_status: 'shared-domain',
  };

  const { data, error } = await db.from('sending_identities').insert(row).select('*').single();
  if (error) {
    // A concurrent request won the unique index; re-read rather than fail the send.
    const { data: raced } = await db
      .from('sending_identities')
      .select('*')
      .eq('workspace_id', workspace.id)
      .maybeSingle();
    if (raced) return raced as SendingIdentity;
    throw error;
  }

  return data as SendingIdentity;
}

export function formatFrom(identity: SendingIdentity): string {
  return `${identity.from_name} <${identity.from_email}>`;
}

/**
 * Sends one campaign email on behalf of a workspace.
 *
 * `idempotencyKey` is the outreach message's key. It travels as a header so a duplicate
 * dispatch is traceable in Resend, and it is recorded on the integration log either way.
 */
export async function sendCampaignEmail(params: {
  workspace: Workspace;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  unsubscribeUrl?: string;
}): Promise<SendResult> {
  const identity = await getSendingIdentity(params.workspace);

  const headers: Record<string, string> = {
    'X-Selestial-Workspace': params.workspace.slug,
    'X-Entity-Ref-ID': params.idempotencyKey,
  };

  // One-click unsubscribe. Mailbox providers surface this natively, which keeps
  // complaint rates down and is table stakes for bulk sending.
  if (params.unsubscribeUrl) {
    headers['List-Unsubscribe'] = `<${params.unsubscribeUrl}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  return deliver({
    from: formatFrom(identity),
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: identity.reply_to ?? undefined,
    headers,
    workspaceId: params.workspace.id,
    operation: 'campaign.email',
    idempotencyKey: params.idempotencyKey,
  });
}
