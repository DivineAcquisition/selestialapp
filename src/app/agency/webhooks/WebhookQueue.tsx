'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Badge, formatDateTime } from '@/components/v2/Primitives';
import type { InboundWebhook } from '@/lib/v2/types';
import { discardWebhook, retryWebhook } from '../actions';

const STATUS_TONE: Record<string, 'green' | 'amber' | 'red' | 'neutral'> = {
  processed: 'green',
  received: 'neutral',
  ignored: 'neutral',
  failed: 'amber',
  dead_letter: 'red',
};

export function WebhookQueue({ webhooks }: { webhooks: InboundWebhook[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function run(id: string, action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    setBusyId(id);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      setNotice(result.ok ? (result.message ?? 'Done.') : (result.error ?? 'Failed.'));
      setBusyId(null);
      router.refresh();
    });
  }

  return (
    <div>
      {notice ? (
        <p className="border-b border-zinc-100 px-5 py-2.5 text-sm text-zinc-600">{notice}</p>
      ) : null}

      <ul className="divide-y divide-zinc-50">
        {webhooks.map((webhook) => {
          const retryable = webhook.status === 'failed' || webhook.status === 'dead_letter';

          return (
            <li key={webhook.id} className="px-5 py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_TONE[webhook.status] ?? 'neutral'}>{webhook.status}</Badge>
                    <span className="text-sm font-medium text-zinc-900">
                      {webhook.provider} · {webhook.event_type ?? 'unknown event'}
                    </span>
                    {!webhook.signature_verified ? (
                      <Badge tone="amber">unsigned</Badge>
                    ) : null}
                    {webhook.attempts > 0 ? (
                      <span className="text-xs text-zinc-400">{webhook.attempts} attempts</span>
                    ) : null}
                  </div>

                  <p className="mt-0.5 text-xs text-zinc-400">
                    Received {formatDateTime(webhook.received_at)}
                    {webhook.processed_at ? ` · processed ${formatDateTime(webhook.processed_at)}` : ''}
                  </p>

                  {webhook.error ? (
                    <p className="mt-1.5 break-words text-sm text-red-600">{webhook.error}</p>
                  ) : null}

                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-600">
                      Raw payload
                    </summary>
                    <pre className="mt-1.5 max-h-72 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                      {JSON.stringify(webhook.raw, null, 2)}
                    </pre>
                  </details>
                </div>

                {retryable ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={pending && busyId === webhook.id}
                      onClick={() => run(webhook.id, () => retryWebhook(webhook.id))}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {pending && busyId === webhook.id ? 'Retrying…' : 'Retry'}
                    </button>
                    <button
                      type="button"
                      disabled={pending && busyId === webhook.id}
                      onClick={() => run(webhook.id, () => discardWebhook(webhook.id))}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Discard
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
