"use client";

import { cn } from "@/lib/utils";
import { useBooking } from "./BookingContext";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface BookingHeaderProps {
  className?: string;
  showPhone?: boolean;
  showWebsite?: boolean;
}

const STEP_LABELS: Record<string, string> = {
  'zip': 'Location',
  'contact': 'Contact',
  'home-size': 'Home Size',
  'service': 'Service',
  'addons': 'Extras',
  'schedule': 'Schedule',
  'checkout': 'Checkout',
  'details': 'Details',
  'confirmation': 'Confirm',
};

export function BookingHeader({ className, showPhone = true, showWebsite = true }: BookingHeaderProps) {
  const { config, currentStep, currentStepId, totalSteps, progressPercent } = useBooking();
  const { branding, theme } = config;

  const stepLabel = STEP_LABELS[currentStepId] || '';

  return (
    <header
      className={cn(
        "w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50",
        className
      )}
    >
      <div className="container max-w-6xl mx-auto px-4 py-4">
        {/* Top Row: Logo and Actions */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.businessName}
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-contain"
              />
            ) : (
              <div
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: theme.primaryGradient }}
              >
                {branding.businessName.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-gray-900 hidden sm:block">
              {branding.businessName}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {showWebsite && branding.website && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                asChild
              >
                <a href={branding.website} target="_blank" rel="noopener noreferrer">
                  <Icon name="globe" size="sm" />
                  <span className="hidden sm:inline">Website</span>
                </a>
              </Button>
            )}
            {showPhone && branding.phone && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                asChild
              >
                <a href={`tel:${branding.phone.replace(/\D/g, '')}`}>
                  <Icon name="phone" size="sm" />
                  <span className="hidden sm:inline">Call</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Step Indicator Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-900">
            <span className="font-semibold">Step {currentStep + 1}</span>
            <span className="text-gray-500"> of {totalSteps}</span>
            {stepLabel && (
              <span className="text-gray-500 ml-2">— {stepLabel}</span>
            )}
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: theme.primaryColor }}
          >
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: theme.primaryGradient,
            }}
          />
        </div>
      </div>
    </header>
  );
}
