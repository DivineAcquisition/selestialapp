'use client';

import { useEffect, useRef } from 'react';

interface Props {
  token: string;
  name: string;
  description: string | null;
  mimeType: string | null;
  url: string | null;
  businessName: string;
  accent: string;
}

/**
 * Renders the attachment inline where the browser can, and reports how long it was open.
 *
 * Duration is sent with `sendBeacon` on unload so the request survives the page closing,
 * which is the only moment we can actually measure. Anything under two seconds is
 * discarded server-side as a bounce rather than a read.
 */
export function AttachmentViewer({
  token,
  name,
  description,
  mimeType,
  url,
  businessName,
  accent,
}: Props) {
  const openedAt = useRef(Date.now());

  useEffect(() => {
    const startedAt = openedAt.current;

    const report = () => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (seconds < 2) return;

      const payload = JSON.stringify({ token, seconds });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track/duration', new Blob([payload], { type: 'application/json' }));
      }
    };

    // `pagehide` fires reliably on mobile Safari where `beforeunload` does not.
    window.addEventListener('pagehide', report);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') report();
    });

    return () => window.removeEventListener('pagehide', report);
  }, [token]);

  const isImage = mimeType?.startsWith('image/');
  const isPdf = mimeType === 'application/pdf';

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white" style={{ borderTopColor: accent, borderTopWidth: 3 }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {businessName}
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">{name}</h1>
          </div>
          {url ? (
            <a
              href={url}
              download
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: accent }}
            >
              Download
            </a>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {description ? <p className="mb-6 text-sm text-zinc-600">{description}</p> : null}

        {!url ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
            This file is temporarily unavailable. Please try again in a moment.
          </p>
        ) : isPdf ? (
          <iframe
            src={url}
            title={name}
            className="h-[75vh] w-full rounded-xl border border-zinc-200 bg-white"
          />
        ) : isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="w-full rounded-xl border border-zinc-200 bg-white" />
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm text-zinc-600">
              This file type cannot be previewed in the browser.
            </p>
            <a
              href={url}
              download
              className="mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: accent }}
            >
              Download {name}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
