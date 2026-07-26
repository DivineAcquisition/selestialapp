import { NextResponse, type NextRequest } from 'next/server';

import { refreshStaleSummaries } from '@/lib/v2/case-file';
import { authorizeCron } from '@/lib/v2/cron-auth';
import { adminDb } from '@/lib/v2/db';
import { completeFinishedCampaigns } from '@/lib/v2/sequence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Hourly housekeeping: regenerate stale case-file summaries, close out campaigns with
 * nothing left to send, and retry webhooks that failed transiently.
 *
 * Deliberately separate from the dispatch tick so a slow AI call can never delay a send.
 */
export async function POST(request: NextRequest) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const started = Date.now();

  const [summaries, campaigns, webhooks] = await Promise.all([
    refreshStaleSummaries(25),
    completeFinishedCampaigns(),
    retryFailedWebhooks(),
  ]);

  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - started,
    summariesRefreshed: summaries,
    campaignsCompleted: campaigns,
    webhooksRetried: webhooks,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}

/**
 * Re-queues webhooks that failed but have not hit the dead-letter threshold. Rows that
 * have exhausted their attempts stay put for a human at /agency/webhooks.
 */
async function retryFailedWebhooks(): Promise<number> {
  const db = adminDb();

  const { data } = await db
    .from('inbound_webhooks')
    .select('id, provider')
    .eq('status', 'failed')
    .order('received_at')
    .limit(20);

  const rows = data ?? [];
  if (rows.length === 0) return 0;

  const { replayWebhook } = await import('@/lib/v2/webhook-replay');

  let retried = 0;
  for (const row of rows) {
    try {
      await replayWebhook(row.id as string);
      retried++;
    } catch (err) {
      console.error('[cron] webhook replay failed', row.id, err);
    }
  }

  return retried;
}
