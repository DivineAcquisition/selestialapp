'use client';

import { useMemo } from 'react';
import { Check, Lock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ServiceLine {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

interface BookingPagePreviewProps {
  /** Customer-facing business name shown in the brand bar. */
  businessName: string;
  /** HEX brand color, e.g. `#7c3aed`. */
  brandColor: string;
  /** Optional tagline rendered under the business name. */
  tagline?: string;
  /** Optional logo URL (or data URI). When omitted, renders initials tile. */
  logoUrl?: string;
  /** Service catalog snapshot. The Recurring service is auto-flagged Most Popular. */
  services: ServiceLine[];
  /** Recurring discount percent (0-100) shown on the recurring tile. */
  recurringDiscountPct: number;
  /** Deposit percent (0-100). */
  depositPercent: number;
  className?: string;
}

/**
 * Live, monochrome preview of what a customer's branded Selestial booking
 * page will look like once provisioned. Updates in real time as the
 * onboarding form changes (brand color, business name, services, pricing).
 *
 * Structurally mirrors the real /book/[businessId] funnel — same window
 * chrome, brand bar, step indicator, service tiles, deposit summary — so
 * what they see during onboarding is what their customers will see.
 */
export function BookingPagePreview({
  businessName,
  brandColor,
  tagline,
  logoUrl,
  services,
  recurringDiscountPct,
  depositPercent,
  className,
}: BookingPagePreviewProps) {
  const initials = useMemo(() => {
    const parts = businessName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0] ?? '').join('').toUpperCase() || 'SC';
  }, [businessName]);

  const safeColor = useMemo(() => normalizeHex(brandColor) ?? '#7c3aed', [brandColor]);
  const onColor = useMemo(() => readableTextColor(safeColor), [safeColor]);

  const popular = services.find((s) => /recurring/i.test(s.name));
  const featured = services[0];
  const featuredPrice = featured?.price ?? 0;
  const featuredDeposit = Math.max(1, Math.round((featuredPrice * depositPercent) / 100));

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)]',
        className
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] text-zinc-500">
          <Lock className="h-3 w-3" />
          book.{slugify(businessName) || 'yourcleaning'}.com
        </div>
      </div>

      {/* Brand bar */}
      <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${businessName} logo`}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-semibold"
            style={{ backgroundColor: safeColor, color: onColor }}
          >
            {initials}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-900">
            {businessName || 'Your Cleaning Business'}
          </p>
          <p className="text-[10px] text-zinc-500">
            {tagline || 'Powered by Selestial'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="border-b border-zinc-200 px-5 py-3">
        <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
          {['ZIP', 'Home', 'Service', 'Pay'].map((label, i) => {
            const isCurrent = i === 2; // freeze on Service step for the preview
            const isDone = i < 2;
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: isDone || isCurrent ? safeColor : '#fff',
                      color: isDone || isCurrent ? onColor : '#71717a',
                      border:
                        !isDone && !isCurrent ? '1px solid #e4e4e7' : `2px solid ${safeColor}`,
                    }}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden font-medium sm:inline',
                      isDone || isCurrent ? 'text-zinc-900' : 'text-zinc-400'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className="mx-2 h-px flex-1"
                    style={{ backgroundColor: i < 2 ? safeColor : '#e4e4e7' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Service step */}
      <div className="space-y-3 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">Choose your service</h3>

        {services.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-xs text-zinc-500">
            Add services in step 3 to see them appear here.
          </div>
        ) : (
          services.map((s) => {
            const isPopular = popular?.id === s.id;
            const showDiscount = isPopular && recurringDiscountPct > 0;
            const finalPrice = showDiscount
              ? Math.round(s.price * (1 - recurringDiscountPct / 100))
              : s.price;
            const savings = showDiscount ? s.price - finalPrice : 0;

            return (
              <div
                key={s.id}
                className={cn(
                  'relative flex items-center justify-between rounded-md border p-3 transition-colors',
                  isPopular
                    ? 'border-2 bg-zinc-50'
                    : 'border-zinc-200 bg-white'
                )}
                style={isPopular ? { borderColor: safeColor } : undefined}
              >
                {isPopular && (
                  <span
                    className="absolute -top-2 left-3 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
                    style={{ backgroundColor: safeColor, color: onColor }}
                  >
                    Most popular
                  </span>
                )}
                <div>
                  <p className="text-xs font-semibold text-zinc-900">{s.name}</p>
                  {showDiscount ? (
                    <p className="text-[10px] font-medium text-emerald-700">
                      Save ${savings} per visit ({recurringDiscountPct}% off)
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500">One-time</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-zinc-900">
                  {showDiscount && (
                    <span className="mr-1 text-xs text-zinc-400 line-through">${s.price}</span>
                  )}
                  ${finalPrice}
                </p>
              </div>
            );
          })
        )}

        {/* Deposit summary (uses first service as the example) */}
        {featured && (
          <div
            className="mt-2 flex items-center justify-between rounded-md p-4"
            style={{ backgroundColor: safeColor, color: onColor }}
          >
            <div>
              <p className="text-[11px] opacity-80">Today&apos;s deposit ({depositPercent}%)</p>
              <p className="text-2xl font-semibold">${featuredDeposit}</p>
            </div>
            <div className="text-right text-[10px] opacity-80">
              <p>Example: {featured.name}</p>
              <p>Balance after service</p>
            </div>
          </div>
        )}

        <button
          type="button"
          className="w-full rounded-md py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: safeColor, color: onColor }}
        >
          Reserve my time
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
          <MapPin className="h-3 w-3" />
          {businessName ? `Serving customers near ${businessName}` : 'Serving your local area'}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// helpers
// ============================================================================
function normalizeHex(input: string | undefined): string | null {
  if (!input) return null;
  const v = input.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

/** Pick black or white text for a given hex background, using YIQ luminance. */
function readableTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? '#0a0a0a' : '#ffffff';
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}
