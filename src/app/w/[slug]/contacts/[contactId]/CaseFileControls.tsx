'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { ContactStatus } from '@/lib/v2/types';
import {
  addContactNote,
  changeContactStatus,
  refreshContactSummary,
  type ContactStatusChange,
} from '../../actions';

interface Props {
  slug: string;
  contactId: string;
  status: ContactStatus;
  canWrite: boolean;
}

export function CaseFileControls({ slug, contactId, status, canWrite }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      router.refresh();
    });
  }

  function submitNote() {
    const text = note.trim();
    if (!text) return;
    run(async () => {
      const result = await addContactNote(slug, contactId, text);
      if (result.ok) {
        setNote('');
        setNoteOpen(false);
      }
      return result;
    });
  }

  const isSuppressed = status === 'opted_out' || status === 'do_not_contact';

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setNoteOpen((open) => !open)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Add note
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => refreshContactSummary(slug, contactId))}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          {pending ? 'Working…' : 'Refresh summary'}
        </button>

        {canWrite ? (
          <StatusMenu
            status={status}
            disabled={pending}
            onChange={(change) => run(() => changeContactStatus(slug, contactId, change))}
          />
        ) : null}
      </div>

      {noteOpen ? (
        <div className="w-80 rounded-lg border border-zinc-200 bg-white p-3">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="What should the next person to open this file know?"
            className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNoteOpen(false)}
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || !note.trim()}
              onClick={submitNote}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Save note
            </button>
          </div>
        </div>
      ) : null}

      {isSuppressed ? (
        <p className="text-xs text-zinc-500">
          {status === 'opted_out'
            ? 'Opted out. No message will be sent on any channel, permanently.'
            : 'Marked do-not-contact. No message will be sent.'}
        </p>
      ) : null}

      {error ? <p className="max-w-sm text-right text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function StatusMenu({
  status,
  disabled,
  onChange,
}: {
  status: ContactStatus;
  disabled: boolean;
  onChange: (change: ContactStatusChange) => void;
}) {
  const [open, setOpen] = useState(false);

  const options: { key: ContactStatusChange; label: string; danger?: boolean }[] = [
    { key: 'mark_booked', label: 'Mark as booked' },
    { key: 'do_not_contact', label: 'Do not contact', danger: true },
    { key: 'opt_out', label: 'Opt out', danger: true },
  ];

  // Reactivating is only offered where it is actually possible: an opt-out is permanent.
  if (status === 'do_not_contact' || status === 'booked') {
    options.unshift({ key: 'reactivate', label: 'Return to active' });
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        Status ▾
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setOpen(false);
                onChange(option.key);
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 ${
                option.danger ? 'text-red-600' : 'text-zinc-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
