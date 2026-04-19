'use client';

import { useEffect, useRef, useState } from 'react';

const FORM_EMBED_SCRIPT_SRC = 'https://api.divineacquisition.io/js/form_embed.js';

interface GhlCalendarEmbedProps {
  /** Full GHL widget URL, e.g. `https://api.divineacquisition.io/widget/booking/<id>` */
  src: string;
  /**
   * Iframe id — MUST match the id GHL generated for this calendar (the embed
   * snippet ships an id like `09O94JadkIsrarld4LMd_1776541575407`).
   * `form_embed.js` posts resize messages targeting this exact id; using a
   * different id breaks auto-resize.
   */
  id: string;
  /** Min height in px before form_embed.js resizes the iframe. */
  minHeight?: number;
  /** Max height in px to cap the iframe. */
  maxHeight?: number;
  className?: string;
  title?: string;
}

/**
 * Robust GHL calendar embed.
 *
 * Mirrors the official GHL snippet:
 *
 *   <iframe src="..." id="..." scrolling="no" />
 *   <script src=".../js/form_embed.js" />
 *
 * What this component does on top of the bare snippet:
 *   1. Lazy-loads `form_embed.js` exactly once per page, AFTER the iframe is
 *      mounted (the script scans for matching iframes at parse time, so it
 *      must run after the iframe exists).
 *   2. Listens for postMessage events from the iframe and updates height
 *      directly as a fallback in case form_embed.js fails to inject the
 *      resize handler (ad blockers, CSP, etc.).
 */
export function GhlCalendarEmbed({
  src,
  id,
  minHeight = 760,
  maxHeight,
  className,
  title = 'Book a time',
}: GhlCalendarEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(minHeight);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Inject form_embed.js after this component (and its iframe) is in the
    //    DOM. The GHL script scans for iframes whose id matches its expected
    //    pattern; if the script runs before the iframe exists, resize never
    //    wires up.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${FORM_EMBED_SCRIPT_SRC}"]`
    );
    if (!existing) {
      const script = document.createElement('script');
      script.src = FORM_EMBED_SCRIPT_SRC;
      script.type = 'text/javascript';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If another instance of this component already loaded the script, we
      // need to manually re-trigger any internal scan. The simplest reliable
      // way is to dispatch a load event the script listens for; if that no-op
      // doesn't help, the postMessage fallback below picks up the slack.
      try {
        existing.dispatchEvent(new Event('load'));
      } catch {
        /* ignore */
      }
    }

    // 2. PostMessage fallback — listen for any message that includes a height.
    //    GHL's script posts payloads shaped like `{ type, height }` or
    //    `{ payload: { height } }`; we coerce both into a number and resize.
    const onMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data) return;
        const candidate = typeof data === 'string' ? JSON.parse(data) : data;
        const next =
          typeof candidate.height === 'number'
            ? candidate.height
            : typeof candidate?.payload?.height === 'number'
            ? candidate.payload.height
            : null;
        if (next && next > 200) {
          const capped = maxHeight ? Math.min(next, maxHeight) : next;
          setHeight(Math.max(minHeight, capped));
        }
      } catch {
        /* ignore non-JSON messages */
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [minHeight, maxHeight]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      id={id}
      title={title}
      loading="lazy"
      scrolling="no"
      className={className}
      style={{
        width: '100%',
        border: 'none',
        overflow: 'hidden',
        height,
        minHeight,
        display: 'block',
      }}
    />
  );
}

/**
 * Preset for the Selestial booking calendar at
 * api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp.
 *
 * Uses the EXACT iframe id from the GHL-supplied snippet so form_embed.js
 * can find it and resize.
 */
export function SelestialBookingCalendar({
  minHeight = 760,
  maxHeight = 1500,
  className,
}: {
  minHeight?: number;
  maxHeight?: number;
  className?: string;
}) {
  return (
    <GhlCalendarEmbed
      src="https://api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp"
      id="09O94JadkIsrarld4LMd_1776541575407"
      minHeight={minHeight}
      maxHeight={maxHeight}
      className={className}
      title="Book a Selestial demo"
    />
  );
}
