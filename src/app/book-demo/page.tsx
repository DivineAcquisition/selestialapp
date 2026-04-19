'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Calendar, Clock, Lock, Video } from 'lucide-react';

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
              we&apos;ll walk you through Selestial on a real cleaning company&apos;s setup.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-zinc-600 md:text-base">
            On the call we&apos;ll review your current booking flow, show you how Selestial
            handles pricing, deposits, and recurring upsell, and answer any questions you
            have. No slide deck, no pitch — just a working demo and a real conversation.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <SelestialBookingCalendar fallbackHeight={900} />
        </div>

        {/* What to know before you book */}
        <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5 md:p-6">
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            What to know before you book
          </p>
          <ul className="space-y-2.5 text-sm text-zinc-700">
            <li className="flex items-start gap-2.5">
              <Video className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                The call runs on Zoom. The link arrives in your inbox the moment you
                book — add it to your calendar so you don&apos;t miss it.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                Have your current pricing handy (home-size tiers, recurring discount,
                deposit %). We&apos;ll plug it in live so you see your real numbers, not
                a generic demo.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                15 minutes is enough to show you the booking flow, the recurring upsell,
                and how setup works. If you need more time we&apos;ll book a follow-up.
              </span>
            </li>
          </ul>
        </div>

        {/* Strict no-show policy */}
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 md:p-6">
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Strict no-show policy
          </p>
          <p className="text-sm leading-relaxed text-red-900">
            We hold your slot exclusively, and our calendar is intentionally limited.
            Please only book if you&apos;re committed to showing up.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-red-900/90">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-700" />
              <span>
                Need to reschedule? Use the link in your confirmation email at least
                <strong> 4 hours before </strong>
                your slot.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-700" />
              <span>
                Cancellations within 4 hours, or no-shows, forfeit the slot — and
                future booking access may be revoked.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-700" />
              <span>
                Show up on time. Late arrivals over 5 minutes count as a no-show so
                we can stay on schedule for the next caller.
              </span>
            </li>
          </ul>
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
