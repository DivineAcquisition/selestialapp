import { NextResponse, type NextRequest } from 'next/server';

/**
 * Guards the cron endpoints.
 *
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Requiring the secret matters
 * more here than on a typical cron route: these endpoints send real messages to real
 * people, so an open one is a way for anyone to drain a client's queue early.
 */
export function authorizeCron(request: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    // Refuse rather than run unauthenticated. A misconfigured deploy should fail loudly.
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured, so scheduled jobs are disabled.' },
      { status: 503 }
    );
  }

  const header = request.headers.get('authorization');
  if (header === `Bearer ${secret}`) return null;

  // Vercel Cron in some regions sends the secret as a query parameter instead.
  if (request.nextUrl.searchParams.get('secret') === secret) return null;

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
