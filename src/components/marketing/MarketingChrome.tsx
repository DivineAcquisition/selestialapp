'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Lock } from 'lucide-react';

import { BrandButton } from '@/components/marketing/BrandButton';

/**
 * Shared marketing chrome — top banner, sticky nav, and footer — used by
 * every public marketing page (`/offer`, `/demo`, `/retarget`, `/book-demo`,
 * `/demo-booked`). Centralizing here keeps the brand wordmark, gradient
 * accent colors (#6428F9 → #9294FF), and CTA shape consistent across
 * the funnel without duplicating layout per page.
 */

// ============================================================================
// TopBanner — full-bleed gradient strip, text only (no leading icon)
// ============================================================================
export function MarketingTopBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[linear-gradient(90deg,#4F1FD0_0%,#6428F9_50%,#9294FF_100%)] px-4 py-2.5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[12px]">
        {children}
      </p>
    </div>
  );
}

// ============================================================================
// Nav — sticky, glassy, big wordmark, optional in-page anchor links + CTA
// ============================================================================
export interface MarketingNavLink {
  href: string;
  label: string;
}

export function MarketingNav({
  homeHref = '/',
  links,
  cta,
  rightSlot,
}: {
  homeHref?: string;
  /** In-page anchors / external links shown on md+ between the logo and CTA. */
  links?: MarketingNavLink[];
  /** Primary CTA on the right. Pass `null` to render nothing. */
  cta?: { href: string; label: string } | null;
  /** Drop-in replacement for the right-hand cell (e.g. a "Secure scheduling"
   *  badge on checkout-style nav). When set, `cta` is ignored. */
  rightSlot?: React.ReactNode;
}) {
  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href={homeHref} className="flex items-center gap-2.5">
          <Image
            src="/logo-full.png"
            alt="Selestial"
            width={300}
            height={80}
            className="h-12 w-auto md:h-14"
            priority
          />
        </Link>

        {links && links.length > 0 && (
          <div className="hidden items-center gap-7 text-[13px] font-medium text-zinc-600 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-zinc-900"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

        {rightSlot ? (
          rightSlot
        ) : cta === null ? null : (
          <BrandButton
            href={cta?.href ?? '/book-demo'}
            variant="primary"
            size="sm"
          >
            {cta?.label ?? 'Book a call'}
            <ArrowRight className="h-3.5 w-3.5" />
          </BrandButton>
        )}
      </div>
    </nav>
  );
}

// Stripped-down nav variant used on checkout / confirmation flows where we
// don't want any in-page links — just the wordmark and a trust marker.
export function MarketingCheckoutNav({
  homeHref = '/',
  rightLabel = 'Secure scheduling',
}: {
  homeHref?: string;
  rightLabel?: string;
}) {
  return (
    <MarketingNav
      homeHref={homeHref}
      rightSlot={
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          {rightLabel}
        </div>
      }
    />
  );
}

// ============================================================================
// Footer — wordmark + © line + Facebook disclaimer
// ============================================================================
export function MarketingFooter({
  showLinks = false,
}: {
  /** When true, also render Privacy / Terms / contact links (used on /demo). */
  showLinks?: boolean;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-5 flex items-center justify-center">
          <Image
            src="/logo-full.png"
            alt="Selestial"
            width={300}
            height={80}
            className="h-12 w-auto md:h-14"
          />
        </div>
        <p className="mb-4 text-[13px] text-zinc-500">
          © {year} Selestial. All rights reserved.
        </p>
        <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-zinc-400">
          This site is not a part of the Facebook website or Facebook Inc.
          Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK
          is a trademark of FACEBOOK, Inc.
        </p>
        {showLinks && (
          <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-zinc-500">
            <a
              href="https://selestial.io/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900"
            >
              Privacy
            </a>
            <a
              href="https://selestial.io/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900"
            >
              Terms
            </a>
            <a href="mailto:hello@selestial.io" className="hover:text-zinc-900">
              hello@selestial.io
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
