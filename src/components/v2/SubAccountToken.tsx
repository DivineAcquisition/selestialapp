'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Badge } from '@/components/v2/Primitives';
import type { PreflightResult } from '@/lib/ghl/preflight';
import {
  checkWorkspaceGhlScopes,
  removeSubAccountToken,
  saveSubAccountToken,
} from '@/app/agency/actions';

interface Props {
  workspaceId: string;
  locationId: string | null;
  hasToken: boolean;
  lastVerifiedAt: string | null;
  canWrite: boolean;
}

/**
 * Where the sub-account's own Private Integration Token is entered.
 *
 * The agency credential creates the sub-account; this token is what lets Selestial work
 * inside it. It is verified against the live API before being stored, so an
 * under-scoped token is rejected here with the missing scope named, rather than accepted
 * and discovered days later when a campaign quietly fails to send.
 *
 * The token is write-only from the UI: it is never sent back to the browser after it is
 * saved, only its status and what it can do.
 */
export function SubAccountToken({
  workspaceId,
  locationId,
  hasToken,
  lastVerifiedAt,
  canWrite,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState('');
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  function save() {
    setNotice(null);
    setPreflight(null);

    startTransition(async () => {
      const result = await saveSubAccountToken(workspaceId, token);
      setPreflight(result.preflight ?? null);

      if (result.ok) {
        setToken('');
        setNotice({ tone: 'ok', text: result.message ?? 'Stored.' });
        router.refresh();
      } else {
        setNotice({ tone: 'error', text: result.error ?? 'Could not store that token.' });
      }
    });
  }

  function verify() {
    setNotice(null);
    startTransition(async () => {
      const result = await checkWorkspaceGhlScopes(workspaceId);
      setPreflight(result);
      setNotice(
        result.ready
          ? { tone: 'ok', text: 'The stored token can do everything Selestial needs.' }
          : { tone: 'error', text: 'The stored token is missing scopes Selestial needs.' }
      );
    });
  }

  function remove() {
    setConfirmingRemoval(false);
    startTransition(async () => {
      const result = await removeSubAccountToken(workspaceId);
      setNotice(
        result.ok
          ? { tone: 'ok', text: result.message ?? 'Removed.' }
          : { tone: 'error', text: result.error ?? 'Could not remove the token.' }
      );
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Sub-account token</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Selestial creates the sub-account with the agency credential, then works inside it
            using this token.
          </p>
        </div>
        <Badge tone={hasToken ? 'green' : 'amber'}>{hasToken ? 'stored' : 'not set'}</Badge>
      </div>

      <div className="px-5 py-4">
        {!locationId ? (
          <p className="text-sm text-zinc-500">
            No sub-account is connected yet. Create or connect one before adding its token.
          </p>
        ) : (
          <>
            {hasToken ? (
              <p className="text-sm text-zinc-600">
                A token is stored for this sub-account.
                {lastVerifiedAt
                  ? ` Last verified ${new Date(lastVerifiedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}.`
                  : ''}{' '}
                It is never shown again — replace it by pasting a new one.
              </p>
            ) : (
              <ol className="list-decimal space-y-1 pl-4 text-sm text-zinc-600">
                <li>Open this client&apos;s sub-account in GoHighLevel.</li>
                <li>
                  Go to <strong>Settings → Private Integrations → New Integration</strong>.
                </li>
                <li>
                  Grant contacts, conversations, custom fields and tags — read and write on each.
                </li>
                <li>Create it, copy the token, and paste it below.</li>
              </ol>
            )}

            {canWrite ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  type="password"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="pit-••••••••-••••-••••-••••-••••••••••••"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-64 flex-1 rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm"
                />
                <button
                  type="button"
                  disabled={pending || !token.trim()}
                  onClick={save}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {pending ? 'Verifying…' : hasToken ? 'Replace token' : 'Verify and store'}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">
                Only the workspace owner or an agency admin can change this.
              </p>
            )}

            {hasToken ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={verify}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {pending ? 'Checking…' : 'Re-check capabilities'}
                </button>

                {canWrite ? (
                  confirmingRemoval ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-600">Remove it? Sending stops.</span>
                      <button
                        type="button"
                        onClick={remove}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Yes, remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingRemoval(false)}
                        className="text-zinc-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingRemoval(true)}
                      className="text-xs text-zinc-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )
                ) : null}
              </div>
            ) : null}
          </>
        )}

        {notice ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              notice.tone === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {notice.text}
          </p>
        ) : null}

        {preflight && preflight.capabilities.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {preflight.capabilities
              .filter((capability) => capability.key !== 'locations')
              .map((capability) => (
                <li key={capability.key} className="flex items-start gap-2 text-xs">
                  <span
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                      capability.ok ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-zinc-600">
                    {capability.label}
                    {!capability.ok ? (
                      <>
                        {' — '}
                        <span className="text-red-600">{capability.impact}</span>
                        {'. Needs '}
                        <code className="rounded bg-zinc-100 px-1">{capability.scope}</code>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
