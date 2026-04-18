'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookingTenant } from '@/contexts/BookingTenantContext';

interface BookingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Ported from AlphaLuxClean (`src/components/booking/BookingProgressBar.tsx`).
 * Same sticky top header + linear progress bar. Logo, phone, and website CTA
 * are sourced from the active Selestial tenant.
 */
export function BookingProgressBar({ currentStep, totalSteps }: BookingProgressBarProps) {
  const { tenant } = useBookingTenant();
  const progress = (currentStep / totalSteps) * 100;

  const phoneHref = tenant?.phone ? `tel:${tenant.phone.replace(/[^\d+]/g, '')}` : undefined;
  const websiteHref = tenant?.website ?? undefined;

  return (
    <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Logo + actions */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2">
            {tenant?.logoUrl ? (
              <Image
                src={tenant.logoUrl}
                alt={tenant.name}
                width={36}
                height={36}
                className="h-8 md:h-10 w-auto rounded-md"
                unoptimized
              />
            ) : (
              <span className="text-base md:text-lg font-semibold text-gray-900">
                {tenant?.name ?? 'Selestial'}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {websiteHref && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Visit Website</span>
                </a>
              </Button>
            )}
            {phoneHref && (
              <Button variant="outline" size="sm" asChild>
                <a href={phoneHref} className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">{tenant?.phone}</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
