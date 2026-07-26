'use client';

import { useState, useTransition } from 'react';

import { Badge } from '@/components/v2/Primitives';
import type { PreflightResult } from '@/lib/ghl/preflight';
import { checkGhlScopes } from '../actions';

/**
 * Runs a live capability check against GoHighLevel.
 *
 * A token can authenticate perfectly and still be useless — one issued with only
 * `locations.readonly` lists sub-accounts happily and 401s on everything else. This
 * surfaces that in seconds instead of as a provisioning failure days later.
 */
export function GhlPreflight({ hasLocation }: { hasLocation: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PreflightResult | null>(null);

  function run() {
    startTransition(async () => {
      setResult(await checkGhlScopes());
    });
  }

  return (
    <div className="border-t border-zinc-100 px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-900">Capability check</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Probes the API to confirm the token can actually do what Selestial needs.
            {!hasLocation ? ' Connect a sub-account first to test the location-scoped calls.' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          {pending ? 'Checking…' : 'Run check'}
        </button>
      </div>

      {result?.error ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{result.error}</p>
      ) : null}

      {result && result.capabilities.length > 0 ? (
        <>
          <ul className="mt-3 space-y-2">
            {result.capabilities.map((capability) => (
              <li key={capability.key} className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    capability.ok ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm text-zinc-800">{capability.label}</span>
                    <Badge tone={capability.ok ? 'green' : 'red'}>
                      {capability.status || 'n/a'}
                    </Badge>
                  </div>
                  {!capability.ok ? (
                    <>
                      <p className="mt-0.5 text-xs text-red-600">{capability.impact}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Needs scope: <code className="rounded bg-zinc-100 px-1">{capability.scope}</code>
                        {capability.detail ? ` · ${capability.detail}` : ''}
                      </p>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              result.ready
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {result.ready
              ? 'The token can do everything Selestial needs.'
              : 'Campaigns cannot send with this token. Add the missing scopes in GoHighLevel under ' +
                'Settings → Private Integrations (or reconnect over agency OAuth), then re-run this check.'}
          </p>
        </>
      ) : null}
    </div>
  );
}
