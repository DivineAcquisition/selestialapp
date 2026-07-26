'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { CampaignState } from '@/lib/v2/types';
import {
  launchCampaignAction,
  pauseCampaignAction,
  regenerateCampaign,
  resumeCampaignAction,
} from '../../actions';

interface Props {
  slug: string;
  campaignId: string;
  status: CampaignState;
  canWrite: boolean;
  hasSequence: boolean;
}

/**
 * Campaign controls. There is deliberately no "edit copy" action anywhere: the operator's
 * only levers over the writing are regenerate and preview.
 */
export function CampaignControls({ slug, campaignId, status, canWrite, hasSequence }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [confirmingLaunch, setConfirmingLaunch] = useState(false);

  if (!canWrite) return null;

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      setNotice(
        result.ok
          ? { tone: 'ok', text: result.message ?? 'Done.' }
          : { tone: 'error', text: result.error ?? 'Something went wrong.' }
      );
      if (result.ok) router.refresh();
    });
  }

  const launchable = (status === 'ready' || status === 'paused') && hasSequence;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending || status === 'generating'}
          onClick={() => run(() => regenerateCampaign(slug, campaignId))}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          {pending ? 'Working…' : 'Regenerate'}
        </button>

        {status === 'active' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => pauseCampaignAction(slug, campaignId))}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Pause
          </button>
        ) : null}

        {status === 'paused' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => resumeCampaignAction(slug, campaignId))}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Resume
          </button>
        ) : null}

        {launchable ? (
          confirmingLaunch ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setConfirmingLaunch(false);
                  run(() => launchCampaignAction(slug, campaignId));
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {pending ? 'Launching…' : 'Yes, start sending'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingLaunch(false)}
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmingLaunch(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Launch
            </button>
          )
        ) : null}
      </div>

      {notice ? (
        <p
          className={`max-w-md text-right text-xs ${
            notice.tone === 'ok' ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}
