"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBookingConfig } from "./BookingContext";
import { Icon } from "@/components/ui/icon";

interface PromoBannerProps {
  className?: string;
}

export function PromoBanner({ className }: PromoBannerProps) {
  const config = useBookingConfig();
  const { promo, theme } = config;
  const [isDismissed, setIsDismissed] = useState(false);

  if (!promo.enabled || isDismissed) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ background: theme.primaryGradient }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,white_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-center gap-3">
          {/* Badge */}
          {promo.badgeText && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-white/20 rounded-full text-white text-xs font-medium">
              {promo.badgeText}
            </span>
          )}

          {/* Promo text */}
          <div className="flex items-center gap-2 text-white text-center">
            <span className="font-bold text-sm md:text-base">
              {promo.headline}
            </span>
            {promo.subheadline && (
              <span className="hidden md:inline text-white/80 text-sm">
                — {promo.subheadline}
              </span>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <Icon name="x" size="sm" className="text-white/70 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
