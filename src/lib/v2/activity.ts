import 'server-only';

import { adminDb } from './db';

export interface ActivityInput {
  workspaceId: string | null;
  action: string;
  /** A sentence a human can read in the activity log without decoding anything. */
  summary: string;
  actorType?: 'user' | 'system' | 'webhook';
  actorId?: string | null;
  actorLabel?: string | null;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Writes one row to the workspace activity log.
 *
 * This is the self-documentation layer: it doubles as the debugging trail and as
 * client-facing proof of work, so `summary` should read as plain English and
 * `metadata` should carry whatever a debugger would want (model, prompt version,
 * provider ids, counts).
 *
 * Never throws — an audit write failing must not take down the action it describes.
 */
export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await adminDb()
      .from('workspace_activity')
      .insert({
        workspace_id: input.workspaceId,
        action: input.action,
        summary: input.summary,
        actor_type: input.actorType ?? 'system',
        actor_id: input.actorId ?? null,
        actor_label: input.actorLabel ?? null,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        metadata: input.metadata ?? {},
      });
  } catch (err) {
    console.error('[activity] failed to record', input.action, err);
  }
}
