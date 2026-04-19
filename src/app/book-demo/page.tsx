'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Lock } from 'lucide-react';

import { SelestialBookingCalendar } from '@/components/marketing/GhlCalendarEmbed';
import { PixelEventOnMount } from '@/components/marketing/MetaPixel';

/**
 * /book-demo — focused calendar landing page for paid traffic.
 *
 *   - Fires `ViewContent` on mount with `content_name: 'Demo Calendar'`.
 *   - Renders the GHL widget the user already configured. Slot constraints
 *     (weekend-only + after-6pm weekday) live on the GHL widget itself —
 *     there's no frontend toggle for that; configure under the calendar's
 *     Availability settings in GHL.
 *   - GHL handles the post-booking redirect to /demo-booked via its
 *     calendar-level "Booking confirmation redirect URL" setting.
 */
export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 antialiased">
      <PixelEventOnMount
        event="ViewContent"
        params={{ content_name: 'Demo Calendar', content_category: 'Calendar' }}
      />

      <CheckoutNav />

      <section className="mx-auto max-w-3xl px-5 pb-16 pt-12 md:pb-24 md:pt-16">
        <div className="mb-8 text-center md:mb-10">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Calendar className="h-3.5 w-3.5" />
            15-minute call
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Pick a time —{' '}
            <span className="text-primary">
              we&apos;ll show you Selestial running live on BadgerLuxClean.
            </span>
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <SelestialBookingCalendar fallbackHeight={900} />
        </div>

        <p className="mt-5 text-center text-xs text-zinc-500">
          Confirmation + Zoom link sent to your email immediately after you book.
        </p>
      </section>
    </main>
  );
}

function CheckoutNav() {
  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/demo" className="flex items-center gap-2.5">
          <Image
            src="/logo-icon-new.png"
            alt="Selestial"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-base font-semibold text-zinc-900">Selestial</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          Secure scheduling
        </div>
      </div>
    </nav>
  );
}
