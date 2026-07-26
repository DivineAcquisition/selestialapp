'use client';

import { useMemo, useState } from 'react';

import type { TimelineEntry } from '@/lib/v2/case-file';

type Filter = 'all' | 'sms' | 'email' | 'events' | 'notes';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
  { key: 'events', label: 'Engagement' },
  { key: 'notes', label: 'Notes' },
];

const DOT_COLOR: Record<string, string> = {
  Replied: 'bg-emerald-500',
  Booked: 'bg-emerald-600',
  'Clicked a link': 'bg-primary',
  'Opened an attachment': 'bg-primary',
  'Opened the email': 'bg-sky-400',
  'Opted out': 'bg-red-500',
  'Email bounced': 'bg-amber-500',
  'Send failed': 'bg-red-400',
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    switch (filter) {
      case 'sms':
        return entries.filter((entry) => entry.channel === 'sms');
      case 'email':
        return entries.filter((entry) => entry.channel === 'email');
      case 'events':
        return entries.filter((entry) => entry.kind === 'event');
      case 'notes':
        return entries.filter((entry) => entry.kind === 'note');
      default:
        return entries;
    }
  }, [entries, filter]);

  if (entries.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-zinc-500">Nothing has happened yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-zinc-100 px-5 py-2.5">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === option.key
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-zinc-500">Nothing matches that filter.</p>
      ) : (
        <ol className="divide-y divide-zinc-50">
          {visible.map((entry) => (
            <li key={entry.id} className="flex gap-3 px-5 py-3.5">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  DOT_COLOR[entry.title] ?? (entry.kind === 'message' ? 'bg-zinc-300' : 'bg-zinc-200')
                }`}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900">{entry.title}</p>
                  <time className="text-xs text-zinc-400">
                    {new Date(entry.at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </time>
                </div>

                {entry.subject ? (
                  <p className="mt-1 text-sm font-medium text-zinc-700">{entry.subject}</p>
                ) : null}

                {entry.body ? (
                  <pre className="mt-1.5 whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-2 font-sans text-sm leading-relaxed text-zinc-700">
                    {entry.body}
                  </pre>
                ) : null}

                {entry.detail && !entry.body ? (
                  <p className="mt-0.5 break-words text-sm text-zinc-600">{entry.detail}</p>
                ) : null}

                {entry.kind === 'message' && entry.metadata?.personalized ? (
                  <p className="mt-1 text-xs text-zinc-400">
                    Personalized for this contact from their case file
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
