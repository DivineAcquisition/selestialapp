"use client";

import { cn } from "@/lib/utils";
import { useBooking } from "../BookingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface HomeSizeStepProps {
  onSelect?: (sizeId: string) => void;
  onCustomQuote?: () => void;
}

export function HomeSizeStep({ onSelect, onCustomQuote }: HomeSizeStepProps) {
  const { config, bookingData, updateBookingData, goToNextStep } = useBooking();
  const { theme } = config;

  const handleSelect = (sizeId: string) => {
    const size = config.homeSizes.find(h => h.id === sizeId);
    
    if (size && size.basePrice === 0) {
      // Custom quote needed
      if (onCustomQuote) {
        onCustomQuote();
      }
      return;
    }

    updateBookingData({ homeSizeId: sizeId });
    
    if (onSelect) {
      onSelect(sizeId);
    } else {
      goToNextStep();
    }
  };

  // Separate custom quote option from regular sizes
  const regularSizes = config.homeSizes.filter(h => h.basePrice > 0);
  const customSize = config.homeSizes.find(h => h.basePrice === 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8">
      <div className="container max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div
            className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6"
            style={{ backgroundColor: `${theme.primaryColor}15` }}
          >
            <Icon name="home" size="2xl" className="text-gray-900" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            How big is your home?
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Select your home size to see instant pricing
          </p>

          {/* Trust badge */}
          {config.trustBadges.some(b => b.type === 'google_guaranteed' && b.enabled) && (
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 border-2 rounded-full"
              style={{ 
                borderColor: theme.successColor,
                backgroundColor: `${theme.successColor}08`
              }}
            >
              <Icon name="shieldCheck" size="sm" style={{ color: theme.successColor }} />
              <span className="text-sm font-medium" style={{ color: theme.successColor }}>
                Verified & Insured
              </span>
            </div>
          )}
        </div>

        {/* Size Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mb-6">
          {regularSizes.map((size) => {
            const isSelected = bookingData.homeSizeId === size.id;
            
            return (
              <Card
                key={size.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg bg-white relative",
                  isSelected
                    ? "ring-2 border-2"
                    : "border border-gray-200 hover:border-gray-300"
                )}
                style={{
                  borderColor: isSelected ? theme.primaryColor : undefined,
                  // @ts-expect-error - CSS custom property for ring color
                  '--tw-ring-color': isSelected ? `${theme.primaryColor}30` : undefined,
                }}
                onClick={() => handleSelect(size.id)}
              >
                {isSelected && (
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Icon name="check" size="sm" className="text-white" />
                  </div>
                )}
                <CardContent className="p-6 md:p-8 text-center">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                    {size.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {size.sqftRange}
                  </p>
                  <p className="text-sm" style={{ color: theme.primaryColor }}>
                    {size.bedroomRange}
                  </p>
                  {size.basePrice > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                        From ${size.basePrice}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Quote Card */}
        {customSize && (
          <Card className="bg-gray-100 border-gray-200">
            <CardContent className="p-5 md:p-6 text-center">
              <p className="text-base md:text-lg font-medium mb-3" style={{ color: theme.primaryColor }}>
                {customSize.label} — {customSize.sqftRange}?
              </p>
              <Button
                variant="outline"
                onClick={() => handleSelect(customSize.id)}
                className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900 rounded-xl"
              >
                Call for Custom Quote
                <Icon name="arrowRight" size="sm" className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
