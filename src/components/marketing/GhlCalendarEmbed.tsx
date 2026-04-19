'use client';

import { useEffect, useRef, useState } from 'react';

const FORM_EMBED_SCRIPT_SRC = 'https://api.divineacquisition.io/js/form_embed.js';

interface GhlCalendarEmbedProps {
  /** Full GHL widget URL, e.g. `https://api.divineacquisition.io/widget/booking/<id>` */
  src: string;
  /** Iframe id — GHL `form_embed.js` keys off this for postMessage resize. */
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
 * Why this exists: a bare `<iframe>` to `api.divineacquisition.io/widget/...`
 * renders, but doesn't auto-resize and often visually collapses below 600px
 * tall. GHL's `form_embed.js` listens for postMessage from the iframe and
 * resizes the matching `<iframe id>` to the actual content height.
 *
 * What this component does:
 *   1. Renders the iframe with the id GHL expects.
 *   2. Lazy-loads `form_embed.js` exactly once per page.
 *   3. Defends against form_embed.js failing to load with a sensible
 *      min-height and a manual postMessage listener as a fallback so the
 *      iframe still resizes to its content.
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
    // 1. Inject form_embed.js once.
    if (typeof document !== 'undefined') {
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
    }

    // 2. Manual postMessage fallback. form_embed.js posts events shaped like
    //    `{ type: 'hsFormCallback', ... }` and `{ type: 'set-height', height }`.
    //    We listen for any message that includes a numeric height and resize.
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
