'use client';

import { useEffect } from 'react';

const ICLOSED_SCRIPT_SRC = 'https://app.iclosed.io/assets/widget.js';

interface IClosedCalendarProps {
  /** Full iClosed booking URL, e.g. `https://app.iclosed.io/e/<workspace>/<event>`. */
  url: string;
  /** Accessible / iframe title. */
  title?: string;
  /** Pixel height of the embed. iClosed manages internal scrolling. */
  height?: number;
  className?: string;
}

/**
 * iClosed inline calendar embed — direct port of the official snippet:
 *
 *   <div class="iclosed-widget" data-url="..."
 *        title="..." style="width:100%;height:620px"></div>
 *   <script src="https://app.iclosed.io/assets/widget.js" async></script>
 *
 * The widget script scans the DOM at parse time for any `.iclosed-widget`
 * nodes and injects an iframe inside them. We:
 *
 *   1. Render the wrapper div with the exact class/data attributes the
 *      script looks for.
 *   2. Inject `widget.js` exactly once per page, AFTER the wrapper is
 *      mounted so the script's scan finds it. If the script is already
 *      present (e.g. another embed on the same page), we still re-trigger
 *      its initializer if available.
 */
export function IClosedCalendar({
  url,
  title = 'Book a time',
  height = 620,
  className,
}: IClosedCalendarProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${ICLOSED_SCRIPT_SRC}"]`
    );

    if (!existing) {
      const script = document.createElement('script');
      script.src = ICLOSED_SCRIPT_SRC;
      script.type = 'text/javascript';
      script.async = true;
      document.body.appendChild(script);
      return;
    }

    // Script is already in the DOM. iClosed's widget exposes a global
    // initializer on some builds — re-run it so this newly-mounted
    // widget gets picked up on client-side navigations.
    const w = window as unknown as {
      iClosedWidget?: { init?: () => void };
      ICLOSED?: { init?: () => void };
    };
    try {
      w.iClosedWidget?.init?.();
      w.ICLOSED?.init?.();
    } catch {
      /* noop — widget will hydrate when it can */
    }
  }, [url]);

  return (
    <div
      className={`iclosed-widget ${className ?? ''}`.trim()}
      data-url={url}
      title={title}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}

/**
 * Preset for the public Selestial discovery / audit call. This replaces the
 * legacy GHL booking widget on /book-demo and /offer/get-started.
 *
 *   URL: https://app.iclosed.io/e/selestialapp/cleaning-company-retention-audit
 */
export function SelestialRetentionAuditCalendar({
  height = 720,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <IClosedCalendar
      url="https://app.iclosed.io/e/selestialapp/cleaning-company-retention-audit"
      title="Cleaning Company Retention Audit"
      height={height}
      className={className}
    />
  );
}
