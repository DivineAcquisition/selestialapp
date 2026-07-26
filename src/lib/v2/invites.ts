import 'server-only';

import { randomBytes } from 'node:crypto';

import { sendPlatformEmail } from '@/lib/v2/email';
import { adminDb } from './db';
import type { WorkspaceRole } from './types';

export interface InviteResult {
  id: string;
  token: string;
  url: string;
  emailSent: boolean;
}

function inviteToken(): string {
  return randomBytes(24).toString('base64url');
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://app.selestial.io';
}

/**
 * Creates (or refreshes) an invite and emails it. Re-inviting the same address reuses
 * the pending row and mints a new token rather than piling up invites, which keeps
 * the provisioning step idempotent.
 */
export async function sendWorkspaceInvite(params: {
  workspaceId: string;
  email: string;
  role?: WorkspaceRole;
  invitedBy?: string | null;
}): Promise<InviteResult> {
  const db = adminDb();
  const email = params.email.trim().toLowerCase();
  const token = inviteToken();
  const role = params.role ?? 'client_owner';

  const { data: existing } = await db
    .from('workspace_invites')
    .select('id')
    .eq('workspace_id', params.workspaceId)
    .eq('email', email)
    .is('accepted_at', null)
    .maybeSingle();

  let inviteId: string;

  if (existing) {
    await db
      .from('workspace_invites')
      .update({
        token,
        role,
        expires_at: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      })
      .eq('id', existing.id);
    inviteId = existing.id as string;
  } else {
    const { data, error } = await db
      .from('workspace_invites')
      .insert({
        workspace_id: params.workspaceId,
        email,
        role,
        token,
        invited_by: params.invitedBy ?? null,
      })
      .select('id')
      .single();
    if (error) throw error;
    inviteId = data.id as string;
  }

  const { data: workspace } = await db
    .from('workspaces')
    .select('name')
    .eq('id', params.workspaceId)
    .maybeSingle();

  const url = `${appUrl()}/invite/${token}`;
  const workspaceName = (workspace?.name as string) ?? 'your workspace';

  const emailSent = await sendPlatformEmail({
    to: email,
    subject: `You've been invited to ${workspaceName} on Selestial`,
    html: inviteHtml(workspaceName, url),
    text: `You've been invited to ${workspaceName} on Selestial.\n\nAccept your invite: ${url}\n\nThis link expires in 14 days.`,
    workspaceId: params.workspaceId,
    operation: 'invite',
  });

  return { id: inviteId, token, url, emailSent };
}

function inviteHtml(workspaceName: string, url: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:32px;background:#f6f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#18181b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;padding:36px">
      <tr><td>
        <p style="margin:0 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6428F9;font-weight:600">Selestial</p>
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">You've been invited to ${escapeHtml(workspaceName)}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b">
          Your reactivation workspace is ready. Sign in to see your contacts, campaigns and weekly results.
        </p>
        <a href="${url}" style="display:inline-block;background:#6428F9;color:#fff;text-decoration:none;padding:13px 26px;border-radius:9px;font-weight:600;font-size:15px">Accept invitation</a>
        <p style="margin:28px 0 0;font-size:13px;color:#71717a">This link expires in 14 days.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

export function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export interface AcceptedInvite {
  workspaceId: string;
  workspaceSlug: string;
  role: WorkspaceRole;
}

export async function acceptInvite(token: string, userId: string): Promise<AcceptedInvite> {
  const db = adminDb();

  const { data: invite } = await db
    .from('workspace_invites')
    .select('id, workspace_id, role, expires_at, accepted_at')
    .eq('token', token)
    .maybeSingle();

  if (!invite) throw new Error('This invitation link is not valid.');
  if (invite.accepted_at) throw new Error('This invitation has already been used.');
  if (new Date(invite.expires_at as string).getTime() < Date.now()) {
    throw new Error('This invitation has expired. Ask your account manager to resend it.');
  }

  await db.from('workspace_members').upsert(
    {
      workspace_id: invite.workspace_id,
      user_id: userId,
      role: invite.role,
    },
    { onConflict: 'workspace_id,user_id' }
  );

  await db
    .from('workspace_invites')
    .update({ accepted_at: new Date().toISOString(), accepted_by: userId })
    .eq('id', invite.id);

  const { data: workspace } = await db
    .from('workspaces')
    .select('slug')
    .eq('id', invite.workspace_id)
    .maybeSingle();

  return {
    workspaceId: invite.workspace_id as string,
    workspaceSlug: (workspace?.slug as string) ?? '',
    role: invite.role as WorkspaceRole,
  };
}
