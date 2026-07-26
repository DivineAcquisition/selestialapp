import 'server-only';

import { adminDb } from './db';
import { markWebhookFailed, markWebhookProcessed } from './webhooks';
import type { InboundWebhook } from './types';

/**
 * Replays a stored webhook through its own endpoint.
 *
 * Posting the saved payload back to the live route means retries exercise the exact same
 * code path as a real delivery — no second, subtly different processing path to keep in
 * sync. The signature check is bypassed with an internal replay header, which is why that
 * header is only honoured when it matches CRON_SECRET.
 */
export const REPLAY_HEADER = 'x-selestial-replay';
export const REPLAY_ID_HEADER = 'x-selestial-replay-id';

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function replayWebhook(id: string): Promise<{ ok: boolean; status: number }> {
  const db = adminDb();

  const { data } = await db.from('inbound_webhooks').select('*').eq('id', id).maybeSingle();
  if (!data) throw new Error('Webhook not found');
  const webhook = data as InboundWebhook;

  const endpoint = `${appUrl()}/api/webhooks/${webhook.provider}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [REPLAY_HEADER]: process.env.CRON_SECRET ?? '',
        // Lets the route reuse this row rather than tripping the dedupe index on itself.
        [REPLAY_ID_HEADER]: id,
      },
      body: JSON.stringify(webhook.raw),
      cache: 'no-store',
    });

    if (response.ok) {
      await markWebhookProcessed(id);
      return { ok: true, status: response.status };
    }

    await markWebhookFailed(id, `Replay returned HTTP ${response.status}`);
    return { ok: false, status: response.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await markWebhookFailed(id, `Replay failed: ${message}`);
    return { ok: false, status: 0 };
  }
}

/** True when a request is an authenticated internal replay of a stored payload. */
export function isAuthorizedReplay(headerValue: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && headerValue && headerValue === secret);
}
