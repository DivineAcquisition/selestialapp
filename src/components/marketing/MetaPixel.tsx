'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

/**
 * Meta Pixel for the Selestial marketing pages on `access.selestial.io`.
 *
 * Defaults to the supplied pixel id (350913587937360) but can be overridden
 * via `NEXT_PUBLIC_META_PIXEL_ID` in the env if you ever rotate it.
 *
 * What this component does:
 *   1. Injects the Meta Pixel `init` + first `PageView` exactly once per
 *      tab via a Next.js `<Script>` tag (afterInteractive strategy).
 *   2. Fires `fbq('track', 'PageView')` on every subsequent client-side
 *      route change. Without this, only the initial page load would be
 *      tracked because Next.js App Router doesn't reload between routes.
 *   3. Renders the standard `<noscript>` 1x1 pixel fallback so visitors
 *      with JS disabled still register a PageView.
 *
 * IMPORTANT: do NOT mount this in the app root layout — it would attach
 * to dashboard / app / book pages too. Only mount inside the marketing
 * route layouts (`/demo`, `/retarget`, `/offer/*`).
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '350913587937360';

declare global {
  interface Window {
    // Meta's `fbq` function — typed loosely to match Meta's docs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

// ---------------------------------------------------------------------------
// Public helpers — type-safe wrappers around `window.fbq('track', ...)` so
// individual page components can fire conversion events without reaching for
// the global directly. All helpers no-op cleanly if the pixel isn't loaded
// (SSR, ad blockers, etc.).
// ---------------------------------------------------------------------------

type FbqEventParams = Record<string, string | number | boolean | undefined>;

/** Fire any standard or custom Meta Pixel event. */
export function trackPixelEvent(eventName: string, params?: FbqEventParams) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (params) {
    window.fbq('track', eventName, params);
  } else {
    window.fbq('track', eventName);
  }
}

/** Standard `ViewContent` event. */
export function trackViewContent(params?: {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}) {
  trackPixelEvent('ViewContent', params as FbqEventParams);
}

/** Standard `Schedule` event — used when a calendar booking is confirmed. */
export function trackSchedule(params?: { value?: number; currency?: string }) {
  trackPixelEvent('Schedule', params as FbqEventParams);
}

/** Standard `Lead` event — when a form is submitted but not yet purchased. */
export function trackLead(params?: { value?: number; currency?: string; content_name?: string }) {
  trackPixelEvent('Lead', params as FbqEventParams);
}

/**
 * Fire-on-mount helper component. Drop into any page that should record a
 * specific event on first render. Usage:
 *
 *   <PixelEventOnMount event="ViewContent" params={{ content_name: 'Demo Calendar' }} />
 *
 * Idempotent within a single mount; remounts will re-fire (intentional —
 * each route visit counts).
 */
export function PixelEventOnMount({
  event,
  params,
}: {
  event: string;
  params?: FbqEventParams;
}) {
  useEffect(() => {
    trackPixelEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Fires `PageView` whenever pathname or query string changes. */
function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    window.fbq('track', 'PageView');
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
          `.trim(),
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPixelPageView />
      </Suspense>
    </>
  );
}
