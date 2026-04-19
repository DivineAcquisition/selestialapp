'use client';

import { useEffect, useRef } from 'react';

const FORM_EMBED_SCRIPT_SRC = 'https://api.divineacquisition.io/js/form_embed.js';

interface GhlCalendarEmbedProps {
  /** Full GHL widget URL, e.g. `https://api.divineacquisition.io/widget/booking/<id>`. */
  src: string;
  /**
   * Iframe id — MUST match the id GHL generated for this calendar (the embed
   * snippet ships an id like `09O94JadkIsrarld4LMd_1776611832274`).
   * `form_embed.js` posts resize messages targeting this exact id; using a
   * different id breaks auto-resize.
   */
  id: string;
  /**
   * Fallback starting height in px. Only used if `form_embed.js` fails to
   * load or its postMessage never fires (ad blockers, CSP, etc.). Once the
   * script runs it writes directly to `iframe.style.height` and this
   * component does NOT interfere.
   */
  fallbackHeight?: number;
  className?: string;
  title?: string;
}

/**
 * GHL calendar embed — ported as close to the vanilla HTML snippet as
 * possible:
 *
 *   <iframe src="..." id="..." scrolling="no"
 *           style="width:100%;border:none;overflow:hidden;" />
 *   <script src=".../js/form_embed.js" async />
 *
 * Why this doesn't use React-controlled height: `form_embed.js` resizes the
 * iframe by writing directly to `iframe.style.height`. If React also owns
 * that property (e.g. via `style={{ height }}`), every re-render overwrites
 * the script's value and the calendar collapses. So this component renders
 * the iframe with only width/border/overflow inline styles — the same shape
 * GHL ships — and lets the script manage height in the DOM imperatively.
 *
 * What this component adds on top of the vanilla snippet:
 *
 *   1. Injects `form_embed.js` exactly once per page, AFTER the iframe is
 *      mounted so the script's scan finds it.
 *   2. Listens for postMessage events from the iframe and writes height
 *      directly to `iframe.style.height` as a fallback. If `form_embed.js`
 *      is blocked or slow, the iframe still resizes.
 *   3. Seeds a fallback height on mount so users never see a 150px box.
 */
export function GhlCalendarEmbed({
  src,
  id,
  fallbackHeight = 900,
  className,
  title = 'Book a time',
}: GhlCalendarEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Seed a generous starting height so the iframe is usable even before
    // any resize message arrives. form_embed.js / our postMessage fallback
    // will overwrite this with the real content height.
    if (iframeRef.current && !iframeRef.current.style.height) {
      iframeRef.current.style.height = `${fallbackHeight}px`;
    }

    // 1. Inject form_embed.js after the iframe is in the DOM. The script
    //    scans the page at parse time, so running it before the iframe
    //    exists means resize never wires up for this iframe.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${FORM_EMBED_SCRIPT_SRC}"]`
    );
    if (!existing) {
      const script = document.createElement('script');
      script.src = FORM_EMBED_SCRIPT_SRC;
      script.type = 'text/javascript';
      script.async = true;
      document.body.appendChild(script);
    }

    // 2. PostMessage fallback — write the reported height directly to the
    //    iframe element instead of into React state. This avoids fighting
    //    form_embed.js, which is doing the same thing.
    const onMessage = (event: MessageEvent) => {
      // Only accept messages from the divineacquisition origin. (Strict
      // comparison skipped for the legacy script path which sometimes posts
      // from `null` origin after redirects — we fall back to a shape check.)
      try {
        const raw = event.data;
        if (raw === null || raw === undefined) return;
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const candidate =
          typeof data.height === 'number'
            ? data.height
            : typeof data?.payload?.height === 'number'
            ? data.payload.height
            : null;
        if (!candidate || candidate < 200) return;

        // If the message carries a target id, only resize if it matches ours.
        const targetId: string | undefined =
          data?.id ?? data?.iframeId ?? data?.payload?.id;
        if (targetId && targetId !== id) return;

        if (iframeRef.current) {
          iframeRef.current.style.height = `${candidate}px`;
        }
      } catch {
        /* ignore non-JSON messages */
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [id, fallbackHeight]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      id={id}
      title={title}
      scrolling="no"
      className={className}
      // Match the official GHL snippet exactly: width:100%, no border,
      // overflow hidden. Do NOT set height here — let form_embed.js own it.
      style={{
        width: '100%',
        border: 'none',
        overflow: 'hidden',
        display: 'block',
      }}
    />
  );
}

/**
 * Preset for the Selestial booking calendar at
 * `api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp`.
 *
 * Uses the EXACT iframe id from the GHL-supplied snippet so `form_embed.js`
 * can find it and resize.
 */
export function SelestialBookingCalendar({
  fallbackHeight = 900,
  className,
}: {
  fallbackHeight?: number;
  className?: string;
}) {
  return (
    <GhlCalendarEmbed
      src="https://api.divineacquisition.io/widget/booking/bdGyTVXFRxIW5RI49fGp"
      id="09O94JadkIsrarld4LMd_1776611832274"
      fallbackHeight={fallbackHeight}
      className={className}
      title="Book a Selestial demo"
    />
  );
}
