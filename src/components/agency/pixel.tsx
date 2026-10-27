"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { activePixelId } from "@/lib/marketing/agency";

type PixelParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    // Meta's fbq queue. Typed loosely to match their snippet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

export function trackPixelEvent(eventName: string, params?: PixelParams) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (!activePixelId()) return;
  if (params) {
    window.fbq("track", eventName, params);
  } else {
    window.fbq("track", eventName);
  }
}

export function trackLead(params?: PixelParams) {
  trackPixelEvent("Lead", { content_name: "Lead Leak Audit", ...params });
}

export function trackSchedule(params?: PixelParams) {
  trackPixelEvent("Schedule", { content_name: "Lead Leak Audit", ...params });
}

function PixelPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    trackPixelEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}

export function AgencyPixel() {
  const pixelId = activePixelId();
  if (!pixelId) return null;

  return (
    <>
      <Script
        id="selestial-meta-pixel"
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
fbq('init', '${pixelId}');
fbq('track', 'PageView');
          `.trim(),
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PixelPageViews />
      </Suspense>
    </>
  );
}

export function ScheduleEventOnMount() {
  useEffect(() => {
    trackSchedule();
  }, []);
  return null;
}
