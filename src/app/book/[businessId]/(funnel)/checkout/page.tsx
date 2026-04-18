'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { BookingProgressBar } from '@/components/booking/v2/BookingProgressBar';
import { StripePaymentForm } from '@/components/booking/v2/StripePaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '@/contexts/BookingFlowContext';
import { useBookingTenant } from '@/contexts/BookingTenantContext';

/**
 * Step 4 — Checkout (25% deposit via Stripe Payment Element).
 * Layout, summary card, and flow ported from
 * AlphaLuxClean (`src/pages/book/Checkout.tsx`).
 */
export default function BookCheckoutPage() {
  const router = useRouter();
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;
  const { tenant } = useBookingTenant();
  const { bookingData, updateBookingData } = useBooking();

  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const finalPrice = (bookingData.basePrice || 0) - (bookingData.promoDiscount || 0);
  const depositPercentage = (tenant?.depositPercent ?? 25) / 100;
  const finalDepositAmount = Math.round(finalPrice * depositPercentage);
  const balanceDue = finalPrice - finalDepositAmount;

  useEffect(() => {
    if (!bookingData.zipCode || !bookingData.basePrice) {
      router.replace(`/book/${businessId}/zip`);
    }
  }, [bookingData.zipCode, bookingData.basePrice, businessId, router]);

  const initializePayment = useCallback(async () => {
    if (isInitializing || clientSecret) return;
    setIsInitializing(true);

    try {
      const customerData = {
        email: bookingData.contactInfo.email,
        firstName: bookingData.contactInfo.firstName,
        lastName: bookingData.contactInfo.lastName,
        phone: bookingData.contactInfo.phone,
        address1: bookingData.contactInfo.address1,
        address2: bookingData.contactInfo.address2,
        city: bookingData.contactInfo.city || bookingData.city,
        state: bookingData.contactInfo.state || bookingData.state,
        zip: bookingData.contactInfo.zip || bookingData.zipCode,
      };

      const bookingPayload = {
        serviceType: bookingData.serviceType,
        frequency: bookingData.frequency,
        homeSize: bookingData.homeSizeId,
        zipCode: bookingData.zipCode,
        offerName: bookingData.offerName,
        offerType: bookingData.offerType,
        promoCode: bookingData.promoCode || null,
        promoDiscountCents: bookingData.promoDiscount
          ? Math.round(bookingData.promoDiscount * 100)
          : 0,
        basePriceCents: Math.round(finalPrice * 100),
        depositCents: Math.round(finalDepositAmount * 100),
        balanceDueCents: Math.round(balanceDue * 100),
      };

      const res = await fetch(`/api/booking/${businessId}/payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalDepositAmount,
          customerData,
          bookingData: bookingPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      setBookingId(data.bookingId);
      setClientSecret(data.clientSecret);
      updateBookingData({ bookingId: data.bookingId });
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initialize payment');
    } finally {
      setIsInitializing(false);
    }
  }, [
    bookingData,
    finalPrice,
    finalDepositAmount,
    balanceDue,
    businessId,
    isInitializing,
    clientSecret,
    updateBookingData,
  ]);

  useEffect(() => {
    if (bookingData.contactInfo?.email && !clientSecret) {
      initializePayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.contactInfo?.email]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!bookingId) return;
    try {
      const res = await fetch(`/api/booking/${businessId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentIntentId,
          paymentStatus: 'deposit_paid',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to confirm payment');
      }
      toast.success('Deposit paid successfully!');
      router.push(`/book/${businessId}/details?booking_id=${bookingId}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Payment recorded but failed to update booking');
    }
  };

  if (!bookingData.basePrice) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <BookingProgressBar currentStep={4} totalSteps={6} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="mb-6 border-primary/30 bg-primary/5 shadow-lg">
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left">
              <Badge className="bg-primary text-primary-foreground text-sm md:text-base px-3 md:px-4 py-1.5 whitespace-nowrap font-bold">
                ✨ New Customer Special
              </Badge>
              <div>
                <h2 className="font-bold text-base md:text-lg text-foreground mb-1">
                  $25 Off Deep Clean + 10% Off Recurring Service
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  48-Hour Re-Clean Guarantee • Insured & Bonded
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Your Discount is Applied!</h1>
          <p className="text-lg text-muted-foreground">
            Pay only {tenant?.depositPercent ?? 25}% today to reserve your spot. No hidden fees, no
            contracts.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold">{bookingData.offerName || 'Cleaning'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold">
                  {bookingData.city}, {bookingData.state}
                </span>
              </div>

              <Separator />

              {bookingData.promoCode && bookingData.promoDiscount && bookingData.promoDiscount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Price</span>
                    <span className="line-through text-muted-foreground">
                      ${(bookingData.basePrice ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm bg-primary/10 p-2 rounded-lg border border-primary/30">
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <Tag className="w-4 h-4" />
                      {bookingData.promoCode}
                    </span>
                    <span className="text-primary font-bold">
                      -${bookingData.promoDiscount.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold">${finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit (today)</span>
                <span className="font-semibold text-primary">${finalDepositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance (after service)</span>
                <span className="font-semibold">${balanceDue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {isInitializing && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initializing secure payment…
                </div>
              )}
              {!isInitializing && clientSecret && (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  depositAmount={finalDepositAmount}
                  totalAmount={finalPrice}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => router.push(`/book/${businessId}/offer`)}
                />
              )}
              {!isInitializing && !clientSecret && (
                <div className="text-center py-8">
                  <Button variant="outline" onClick={() => initializePayment()}>
                    Retry payment setup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
