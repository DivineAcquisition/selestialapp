'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import type { ProvisioningStep } from '@/lib/v2/types';
import {
  connectExistingSubAccount,
  resendInvite,
  retryProvisioningStep,
  runAllProvisioning,
} from '../../actions';

interface Props {
  workspaceId: string;
  steps: ProvisioningStep[];
  hasLocation: boolean;
}

const STATUS_STYLE: Record<string, { dot: string; label: string; tone: string }> = {
  succeeded: { dot: 'bg-emerald-500', label: 'Done', tone: 'text-emerald-700' },
  running: { dot: 'bg-primary animate-pulse', label: 'Running', tone: 'text-primary' },
  pending: { dot: 'bg-zinc-300', label: 'Waiting', tone: 'text-zinc-500' },
  skipped: { dot: 'bg-amber-400', label: 'Action needed', tone: 'text-amber-700' },
  failed: { dot: 'bg-red-500', label: 'Failed', tone: 'text-red-700' },
};

/**
 * Step-by-step provisioning status with a retry per step.
 *
 * Polls while anything is still moving, because provisioning is kicked off in the
 * background and the operator is watching this screen to know when it lands.
 */
export function ProvisioningPanel({ workspaceId, steps, hasLocation }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [locationId, setLocationId] = useState('');

  const inFlight = steps.some((step) => step.status === 'running' || step.status === 'pending');

  useEffect(() => {
    if (!inFlight) return;
    const timer = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(timer);
  }, [inFlight, router]);

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      setNotice(
        result.ok
          ? { tone: 'ok', text: result.message ?? 'Done.' }
          : { tone: 'error', text: result.error ?? 'Something went wrong.' }
      );
      router.refresh();
    });
  }

  const done = steps.filter((s) => s.status === 'succeeded' || s.status === 'skipped').length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Provisioning</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {done} of {steps.length} steps complete. Each step is safe to run again.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => runAllProvisioning(workspaceId))}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? 'Working…' : 'Run remaining steps'}
          </button>
        </div>

        <ol className="divide-y divide-zinc-50">
          {steps.map((step) => {
            const style = STATUS_STYLE[step.status] ?? STATUS_STYLE.pending;

            return (
              <li key={step.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900">{step.label}</p>
                    <span className={`text-xs font-medium ${style.tone}`}>{style.label}</span>
                  </div>

                  {step.error ? (
                    <p className="mt-1 break-words text-xs text-red-600">{step.error}</p>
                  ) : null}

                  {step.status === 'skipped' && step.step_key === 'register_webhooks' ? (
                    <p className="mt-1 text-xs text-amber-700">
                      GoHighLevel delivers webhooks through the marketplace app subscription, not a
                      per-location API. Subscribe the app to the events listed below, then set
                      GHL_WEBHOOK_APP_CONFIGURED=true and re-run this step.
                    </p>
                  ) : null}

                  {step.result && Object.keys(step.result).length > 0 ? (
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-600">
                        Result
                      </summary>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-600">
                        {JSON.stringify(step.result, null, 2)}
                      </pre>
                    </details>
                  ) : null}

                  {step.attempts > 1 ? (
                    <p className="mt-1 text-xs text-zinc-400">{step.attempts} attempts</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => retryProvisioningStep(workspaceId, step.step_key))}
                  className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {step.status === 'succeeded' ? 'Re-run' : 'Retry'}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {!hasLocation ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Connect an existing sub-account</h3>
          <p className="mt-1 text-xs text-zinc-500">
            If this client already has a sub-account in your agency, paste its location ID instead
            of creating a new one. The remaining provisioning steps run against it.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              placeholder="Location ID"
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={pending || !locationId.trim()}
              onClick={() => run(() => connectExistingSubAccount(workspaceId, locationId))}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Connect
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900">Client access</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Re-sends the workspace invite. The previous link stops working.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => resendInvite(workspaceId))}
          className="mt-3 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Resend invite
        </button>
      </div>

      {notice ? (
        <p className={`text-sm ${notice.tone === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}
