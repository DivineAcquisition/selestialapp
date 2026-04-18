'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Sparkles } from 'lucide-react';

import { BookingProgressBar } from '@/components/booking/v2/BookingProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useBookingTenant } from '@/contexts/BookingTenantContext';

interface BookingRecord {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  service_type: string | null;
  service_date: string | null;
  time_slot: string | null;
  service_address: string | null;
  base_price_cents: number | null;
  deposit_cents: number | null;
  balance_due_cents: number | null;
  payment_status: string | null;
}

const serviceTypeLabels: Record<string, string> = {
  regular: 'Standard Cleaning',
  deep: 'Deep Cleaning',
  move_in_out: 'Move-In/Out Cleaning',
};

/**
 * Step 6 — Confirmation / receipt.
 * Layout ported from AlphaLuxClean (`src/pages/book/Confirmation.tsx`)
 * including the routing guard that bounces users back to /book/details
 * if address / service_date / time_slot are missing.
 */
export default function BookConfirmationPage() {
  const router = useRouter();
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const { tenant } = useBookingTenant();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/booking/${businessId}/confirmation?booking_id=${encodeURIComponent(bookingId)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
        const data = await res.json();
        if (cancelled) return;

        // Routing guard: deposit paid but address/schedule missing → /details
        const paymentDone = ['deposit_paid', 'paid', 'fully_paid'].includes(
          data.booking?.payment_status ?? ''
        );
        const missingDetails =
          !data.booking?.service_address ||
          !data.booking?.service_date ||
          !data.booking?.time_slot;
        if (paymentDone && missingDetails) {
          router.replace(`/book/${businessId}/details?booking_id=${bookingId}`);
          return;
        }
        setBooking(data.booking);
      } catch (err) {
        console.error('Failed to fetch booking:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, businessId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">No booking found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t locate that booking. Please start again or contact{' '}
            {tenant?.name ?? 'us'}.
          </p>
          <Button onClick={() => router.push(`/book/${businessId}/zip`)}>Start Over</Button>
        </Card>
      </div>
    );
  }

  const total = (booking.base_price_cents ?? 0) / 100;
  const deposit = (booking.deposit_cents ?? 0) / 100;
  const balance = (booking.balance_due_cents ?? 0) / 100;

  return (
    <div className="min-h-screen bg-background">
      <BookingProgressBar currentStep={6} totalSteps={6} />

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-8 w-8" />
          </div>
          <Badge className="mb-3 bg-primary/10 text-primary px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Booking Confirmed
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">You&apos;re all set!</h1>
          <p className="text-muted-foreground">
            We sent a confirmation to <strong>{booking.customer_email}</strong>. {tenant?.name ?? 'Our team'}{' '}
            will reach out shortly to confirm arrival.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-mono text-xs">{booking.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service</span>
              <span className="font-semibold">
                {serviceTypeLabels[booking.service_type ?? ''] ?? booking.service_type}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-semibold">{booking.service_date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-semibold capitalize">{booking.time_slot}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Address</span>
              <span className="font-semibold text-right max-w-[60%]">{booking.service_address}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit paid</span>
              <span className="font-semibold text-primary">${deposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance due (after service)</span>
              <span className="font-semibold">${balance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-2">
            <h2 className="text-lg font-semibold">What happens next</h2>
            <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
              <li>You&apos;ll get a confirmation email with your receipt.</li>
              <li>{tenant?.name ?? 'The team'} will text you the day before to confirm arrival.</li>
              <li>The remaining balance is collected after service is complete.</li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {tenant?.phone && (
            <Button variant="outline" asChild>
              <a href={`tel:${tenant.phone.replace(/[^\d+]/g, '')}`}>
                Call {tenant.name}
              </a>
            </Button>
          )}
          {tenant?.website && (
            <Button variant="outline" asChild>
              <a href={tenant.website} target="_blank" rel="noopener noreferrer">
                Visit website
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
