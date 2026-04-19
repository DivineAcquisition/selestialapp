'use client';

import { useEffect } from 'react';

interface WistiaPlayerProps {
  /** Wistia media id, e.g. '7zigms7aiy'. */
  mediaId: string;
  /** Aspect ratio (width / height). Defaults to 16:9. */
  aspect?: number;
  className?: string;
}

const PLAYER_SCRIPT = 'https://fast.wistia.com/player.js';
const EMBED_SCRIPT_BASE = 'https://fast.wistia.com/embed/';

function loadScriptOnce(src: string, type?: 'module') {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  if (type) script.type = type;
  document.body.appendChild(script);
}

/**
 * Mounts the Wistia <wistia-player> web component for a given media id.
 * Loads `player.js` and the per-media embed script exactly once per page.
 *
 * Designed for video sales letters (VSLs) embedded on the ad landing page.
 */
export function WistiaPlayer({ mediaId, aspect = 16 / 9, className }: WistiaPlayerProps) {
  useEffect(() => {
    loadScriptOnce(PLAYER_SCRIPT);
    loadScriptOnce(`${EMBED_SCRIPT_BASE}${mediaId}.js`, 'module');
  }, [mediaId]);

  const swatchUrl = `${EMBED_SCRIPT_BASE}medias/${mediaId}/swatch`;

  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Inline style guarantees the placeholder swatch shows before the
          web component upgrades. Mirrors Wistia's recommended snippet. */}
      <style>{`
        wistia-player[media-id='${mediaId}']:not(:defined) {
          background: center / contain no-repeat url('${swatchUrl}');
          display: block;
          filter: blur(5px);
          padding-top: ${(1 / aspect) * 100}%;
        }
      `}</style>
      {/* @ts-expect-error - <wistia-player> is a web component, not a React intrinsic */}
      <wistia-player media-id={mediaId} aspect={String(aspect)} />
    </div>
  );
}
