'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Check, Mail, Sparkles } from 'lucide-react';

import { WistiaPlayer } from '@/components/marketing/WistiaPlayer';
import { PixelEventOnMount } from '@/components/marketing/MetaPixel';

/**
 * /demo-booked — confirmation page GHL redirects to after a calendar booking.
 *
 *   - Fires `Schedule` on mount (value 297 USD) for ad-platform attribution.
 *   - Confirmation message + email reminder.
 *   - Embeds the 2-minute precall Wistia video (media id `fo2idud6wc`).
 *
 * To wire this up: in GHL, set the calendar's "Booking confirmation
 * redirect URL" to `https://access.selestial.io/demo-booked`. (GHL appends
 * its own query string; we ignore it.)
 */
export default function DemoBookedPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 antialiased">
      <PixelEventOnMount event="Schedule" params={{ value: 297, currency: 'USD' }} />

      <CheckoutNav />

      <section className="mx-auto max-w-3xl px-5 pb-16 pt-12 md:pb-24 md:pt-16">
        <div className="mb-8 text-center md:mb-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-7 w-7" />
          </div>
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <Calendar className="h-3.5 w-3.5" />
            Demo confirmed
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            You&apos;re booked.{' '}
            <span className="text-primary">Check your email for the Zoom link.</span>
          </h1>
          <p className="mx-auto mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-500">
            <Mail className="h-3.5 w-3.5" />
            Confirmation just hit your inbox. Add it to your calendar so we don&apos;t no-show
            each other.
          </p>
        </div>

        {/* Precall video */}
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Watch first · 2 minutes
          </p>
          <h2 className="mb-3 text-balance text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Here&apos;s what to expect on our call.
          </h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 shadow-sm">
            <WistiaPlayer mediaId="fo2idud6wc" aspect={16 / 9} />
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500">
            Watching the precall ahead of time means we spend the full 15 minutes on you, not
            on intro.
          </p>
        </div>

        {/* Next steps */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8">
          <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Before the call
          </p>
          <ol className="space-y-3 text-sm text-zinc-700">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                1
              </span>
              <span>Watch the 2-minute precall video above.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                2
              </span>
              <span>
                Have your current pricing handy (home-size tiers, recurring discount, deposit
                %). We&apos;ll plug it in live so you see your real numbers, not a generic demo.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                3
              </span>
              <span>
                Show up. We&apos;ll have your branded preview ready and walk through how to go
                live in 48 hours.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/demo"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            Back to home
          </Link>
        </div>
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
        <span className="text-xs text-zinc-500">Demo confirmed</span>
      </div>
    </nav>
  );
}
