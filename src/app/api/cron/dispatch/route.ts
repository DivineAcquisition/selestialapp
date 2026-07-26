import { NextResponse, type NextRequest } from 'next/server';

import { dispatchDueMessages } from '@/lib/v2/dispatch';
import { authorizeCron } from '@/lib/v2/cron-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * The send tick. Runs every 5 minutes (see vercel.json) and drains whatever is due,
 * up to one batch. Anything left over is picked up by the next tick, which is what keeps
 * a large launch from needing a single long-running job.
 */
export async function POST(request: NextRequest) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const started = Date.now();
  const result = await dispatchDueMessages();

  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - started,
    ...result,
    // Only the first few, so a broken campaign does not produce a megabyte of log.
    errors: result.errors.slice(0, 10),
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
