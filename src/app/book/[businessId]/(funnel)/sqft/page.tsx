'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Home } from 'lucide-react';

import { BookingProgressBar } from '@/components/booking/v2/BookingProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/BookingFlowContext';
import { useBookingTenant } from '@/contexts/BookingTenantContext';
import { HOME_SIZE_RANGES } from '@/lib/booking/pricing';

/**
 * Step 2 — Home size selection.
 * Layout ported from AlphaLuxClean (`src/pages/book/SquareFeet.tsx`).
 */
export default function BookSquareFeetPage() {
  const router = useRouter();
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;
  const { tenant } = useBookingTenant();
  const { bookingData, updateBookingData } = useBooking();
  const [selectedId, setSelectedId] = useState(bookingData.homeSizeId);

  useEffect(() => {
    if (!bookingData.zipCode) router.replace(`/book/${businessId}/zip`);
  }, [bookingData.zipCode, businessId, router]);

  const handleSelect = (homeSizeId: string) => {
    setSelectedId(homeSizeId);
    updateBookingData({ homeSizeId });
    setTimeout(() => router.push(`/book/${businessId}/offer`), 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <BookingProgressBar currentStep={2} totalSteps={6} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">How big is your home?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your home size to see instant pricing for a professional clean.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {HOME_SIZE_RANGES.filter((range) => !range.requiresEstimate).map((range) => {
            const isSelected = selectedId === range.id;
            return (
              <Card
                key={range.id}
                className={`relative p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? 'border-primary border-2 bg-primary/5 shadow-lg'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
                onClick={() => handleSelect(range.id)}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-primary rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-foreground">{range.label}</div>
                  <div className="text-sm text-muted-foreground">{range.bedroomRange}</div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 text-center border-dashed">
          <p className="text-muted-foreground mb-3">Home larger than 5,000 sq ft?</p>
          {tenant?.phone ? (
            <Button variant="outline" asChild>
              <a
                href={`tel:${tenant.phone.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-2"
              >
                Call {tenant.name} for Custom Quote
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Contact your provider for a custom quote
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
