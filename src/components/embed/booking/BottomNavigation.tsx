"use client";

import { cn } from "@/lib/utils";
import { useBooking } from "./BookingContext";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface BottomNavigationProps {
  className?: string;
  showPrice?: boolean;
  continueText?: string;
  onContinue?: () => void;
  onBack?: () => void;
  continueDisabled?: boolean;
  hideOnDesktop?: boolean;
}

export function BottomNavigation({
  className,
  showPrice = false,
  continueText = "Continue",
  onContinue,
  onBack,
  continueDisabled = false,
  hideOnDesktop = true,
}: BottomNavigationProps) {
  const { bookingData, config, canGoBack, canGoNext, goToPreviousStep, goToNextStep } = useBooking();
  const { theme } = config;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goToPreviousStep();
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      goToNextStep();
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50",
        "animate-in slide-in-from-bottom duration-300",
        "safe-area-inset-bottom",
        hideOnDesktop && "md:hidden",
        className
      )}
    >
      {/* Price display if enabled */}
      {showPrice && bookingData.total > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">Total</span>
          <div className="flex items-baseline gap-2">
            {bookingData.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                ${bookingData.subtotal}
              </span>
            )}
            <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
              ${bookingData.total}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2 p-3">
        {canGoBack && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="flex-shrink-0 h-12 w-12 p-0 rounded-xl"
            aria-label="Go back"
          >
            <Icon name="arrowLeft" size="lg" />
          </Button>
        )}

        <Button
          size="lg"
          onClick={handleContinue}
          disabled={continueDisabled || !canGoNext}
          className="flex-1 h-12 text-base font-semibold rounded-xl ring-2 ring-white/30"
          style={{
            background: theme.primaryGradient,
          }}
        >
          {continueText}
          <Icon name="arrowRight" size="sm" className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
