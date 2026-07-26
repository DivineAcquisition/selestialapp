'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { Workspace } from '@/lib/v2/types';

interface Props {
  workspaces: Workspace[];
  current: Workspace | null;
  isAgencyAdmin: boolean;
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-500',
  onboarding: 'bg-amber-500',
  paused: 'bg-zinc-400',
  churned: 'bg-red-400',
};

/**
 * Global workspace switcher. Agency admins get a searchable list of every client;
 * a client with a single workspace sees a plain label instead of a control that does
 * nothing.
 */
export function WorkspaceSwitcher({ workspaces, current, isAgencyAdmin }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return workspaces;
    return workspaces.filter((w) => w.name.toLowerCase().includes(needle));
  }, [workspaces, query]);

  if (workspaces.length <= 1 && !isAgencyAdmin) {
    return (
      <div className="rounded-lg bg-zinc-50 px-3 py-2">
        <p className="truncate text-sm font-medium text-zinc-900">
          {current?.name ?? 'No workspace'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm hover:bg-zinc-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              STATUS_DOT[current?.status ?? ''] ?? 'bg-zinc-300'
            }`}
          />
          <span className="truncate font-medium text-zinc-900">
            {current?.name ?? 'Select a workspace'}
          </span>
        </span>
        <span className="shrink-0 text-zinc-400">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          {workspaces.length > 6 ? (
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clients"
              className="w-full border-b border-zinc-100 px-3 py-2 text-sm outline-none placeholder:text-zinc-400"
            />
          ) : null}

          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/w/${workspace.slug}`);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    STATUS_DOT[workspace.status] ?? 'bg-zinc-300'
                  }`}
                />
                <span className="truncate text-zinc-700">{workspace.name}</span>
              </button>
            ))}

            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-zinc-400">No matches</p>
            ) : null}
          </div>

          {isAgencyAdmin ? (
            <div className="border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push('/agency');
                }}
                className="w-full px-3 py-2 text-left text-sm font-medium text-primary hover:bg-zinc-50"
              >
                All clients
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
