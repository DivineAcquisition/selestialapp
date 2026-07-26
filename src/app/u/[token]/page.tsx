import { notFound } from 'next/navigation';

import { adminDb } from '@/lib/v2/db';
import { resolveToken } from '@/lib/v2/links';
import { optOutContact } from '@/lib/v2/sequence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Unsubscribe landing page.
 *
 * The opt-out is applied on POST rather than GET, because mail scanners and link
 * prefetchers follow GET links and would otherwise unsubscribe people who never clicked.
 * The `List-Unsubscribe-Post` header points here, so one-click unsubscribe from a mail
 * client still works without a visit.
 */
export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await resolveToken(token);

  if (!link || link.kind !== 'unsubscribe') notFound();

  const db = adminDb();

  const [{ data: workspace }, { data: contact }] = await Promise.all([
    db.from('workspaces').select('name, primary_color').eq('id', link.workspace_id).maybeSingle(),
    link.contact_id
      ? db.from('contacts').select('status, email').eq('id', link.contact_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const businessName = (workspace?.name as string) ?? 'this business';
  const accent = (workspace?.primary_color as string) ?? '#6428F9';
  const alreadyOptedOut = contact?.status === 'opted_out';

  async function unsubscribe() {
    'use server';

    const fresh = await resolveToken(token);
    if (!fresh?.contact_id) return;

    await optOutContact({
      contactId: fresh.contact_id,
      workspaceId: fresh.workspace_id,
      channel: 'email',
      reason: 'Unsubscribed from an email',
      source: 'unsubscribe-link',
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8"
        style={{ borderTopColor: accent, borderTopWidth: 3 }}
      >
        {alreadyOptedOut ? (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">You&apos;re unsubscribed</h1>
            <p className="mt-2 text-sm text-zinc-600">
              {businessName} will not send you any further marketing messages, on any channel.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">
              Unsubscribe from {businessName}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              This stops all marketing messages from {businessName}, by email and by text. It takes
              effect immediately.
            </p>
            <form action={unsubscribe} className="mt-6">
              <button
                type="submit"
                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: accent }}
              >
                Unsubscribe me
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
