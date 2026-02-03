"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { BookingProvider, useBooking } from "./BookingContext";
import { BookingHeader } from "./BookingHeader";
import { PromoBanner } from "./PromoBanner";
import { BottomNavigation } from "./BottomNavigation";
import { ZipStep } from "./steps/ZipStep";
import { HomeSizeStep } from "./steps/HomeSizeStep";
import { ServiceStep } from "./steps/ServiceStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import { CheckoutStep } from "./steps/CheckoutStep";
import {
  BookingWidgetConfig,
  BookingFlowStep,
  DEFAULT_THEME,
  DEFAULT_HOME_SIZES,
  DEFAULT_SERVICES,
  DEFAULT_TIME_SLOTS,
  DEFAULT_ADD_ONS,
  DEFAULT_FREQUENCIES,
  DEFAULT_TRUST_BADGES,
} from "./types";

interface BookingWidgetProps {
  config: Partial<BookingWidgetConfig>;
  className?: string;
  persistKey?: string;
  onBookingComplete?: (bookingId: string) => void;
  onPaymentSubmit?: (data: { option: 'deposit' | 'full'; amount: number }) => void;
}

// Merge partial config with defaults
function mergeConfig(partial: Partial<BookingWidgetConfig>): BookingWidgetConfig {
  return {
    id: partial.id || 'default',
    businessId: partial.businessId || '',
    name: partial.name || 'Booking Widget',
    status: partial.status || 'active',
    branding: {
      businessName: partial.branding?.businessName || 'Your Business',
      logoUrl: partial.branding?.logoUrl,
      phone: partial.branding?.phone,
      email: partial.branding?.email,
      website: partial.branding?.website,
      showRating: partial.branding?.showRating ?? true,
      ratingValue: partial.branding?.ratingValue ?? 4.9,
      reviewCount: partial.branding?.reviewCount ?? 150,
    },
    theme: {
      ...DEFAULT_THEME,
      ...partial.theme,
    },
    flowSteps: partial.flowSteps || ['zip', 'home-size', 'service', 'schedule', 'checkout'],
    services: partial.services || DEFAULT_SERVICES,
    homeSizes: partial.homeSizes || DEFAULT_HOME_SIZES,
    addOns: partial.addOns || DEFAULT_ADD_ONS,
    frequencies: partial.frequencies || DEFAULT_FREQUENCIES,
    timeSlots: partial.timeSlots || DEFAULT_TIME_SLOTS,
    trustBadges: partial.trustBadges || DEFAULT_TRUST_BADGES,
    promo: {
      enabled: partial.promo?.enabled ?? false,
      headline: partial.promo?.headline || '',
      subheadline: partial.promo?.subheadline,
      discountPercent: partial.promo?.discountPercent,
      expiryDate: partial.promo?.expiryDate,
      badgeText: partial.promo?.badgeText,
    },
    depositPercent: partial.depositPercent ?? 25,
    minimumPrice: partial.minimumPrice ?? 50,
    acceptDeposit: partial.acceptDeposit ?? true,
    acceptFullPayment: partial.acceptFullPayment ?? true,
    fullPaymentDiscount: partial.fullPaymentDiscount ?? 5,
    serviceZipCodes: partial.serviceZipCodes || [],
    waitlistEnabled: partial.waitlistEnabled ?? true,
    captureContactFirst: partial.captureContactFirst ?? true,
    requirePhone: partial.requirePhone ?? false,
    requireEmail: partial.requireEmail ?? true,
  };
}

// Inner component that uses the booking context
function BookingWidgetInner({
  onBookingComplete,
  onPaymentSubmit,
}: {
  onBookingComplete?: (bookingId: string) => void;
  onPaymentSubmit?: (data: { option: 'deposit' | 'full'; amount: number }) => void;
}) {
  const { config, currentStepId, bookingData, goToNextStep } = useBooking();
  const { theme } = config;

  // Determine if we should show header/footer
  const showHeader = !['confirmation'].includes(currentStepId);
  const showPromo = config.promo.enabled && ['zip', 'home-size', 'service'].includes(currentStepId);
  const showBottomNav = ['home-size', 'service', 'addons'].includes(currentStepId);

  const handlePaymentSubmit = (data: { option: 'deposit' | 'full'; promoCode?: string }) => {
    const amount = data.option === 'full'
      ? bookingData.total - (config.fullPaymentDiscount ? Math.round(bookingData.total * (config.fullPaymentDiscount / 100)) : 0)
      : bookingData.deposit;

    if (onPaymentSubmit) {
      onPaymentSubmit({ option: data.option, amount });
    }
  };

  // Render step component based on current step
  const renderStep = () => {
    switch (currentStepId) {
      case 'zip':
        return <ZipStep />;
      case 'contact':
        return <ZipStep />; // ZipStep handles contact capture too
      case 'home-size':
        return <HomeSizeStep />;
      case 'service':
        return <ServiceStep showScheduleAfterSelect={config.flowSteps.includes('schedule')} />;
      case 'addons':
        // Could add dedicated AddOnsStep
        return <ServiceStep />;
      case 'schedule':
        return (
          <div className="container max-w-4xl mx-auto px-4 py-6">
            <ScheduleStep showContinue />
          </div>
        );
      case 'checkout':
        return <CheckoutStep onPaymentSubmit={handlePaymentSubmit} />;
      case 'details':
        // Could add PropertyDetailsStep
        return <CheckoutStep onPaymentSubmit={handlePaymentSubmit} />;
      case 'confirmation':
        return (
          <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.heroGradient }}>
            <div className="text-center space-y-6 max-w-md">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${theme.successColor}15` }}
              >
                <svg
                  className="w-12 h-12"
                  style={{ color: theme.successColor }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
              <p className="text-gray-500">
                Thank you for your booking. We've sent a confirmation to {bookingData.email}.
              </p>
            </div>
          </div>
        );
      default:
        return <ZipStep />;
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: theme.bodyFont }}>
      {showHeader && <BookingHeader />}
      {showPromo && <PromoBanner />}
      
      <main>
        {renderStep()}
      </main>

      {showBottomNav && (
        <BottomNavigation
          continueText="Continue"
          showPrice={bookingData.total > 0}
        />
      )}
    </div>
  );
}

// Main exported component
export function BookingWidget({
  config: partialConfig,
  className,
  persistKey,
  onBookingComplete,
  onPaymentSubmit,
}: BookingWidgetProps) {
  const config = useMemo(() => mergeConfig(partialConfig), [partialConfig]);

  return (
    <div className={cn("booking-widget", className)}>
      <BookingProvider config={config} persistKey={persistKey}>
        <BookingWidgetInner
          onBookingComplete={onBookingComplete}
          onPaymentSubmit={onPaymentSubmit}
        />
      </BookingProvider>
    </div>
  );
}

// Export a version that can be embedded as an iframe
export function EmbeddableBookingWidget(props: BookingWidgetProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; }
        `}</style>
      </head>
      <body>
        <BookingWidget {...props} />
      </body>
    </html>
  );
}
