"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBooking } from "../BookingContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import { format } from "date-fns";

interface CheckoutStepProps {
  onPaymentSubmit?: (paymentData: { option: 'deposit' | 'full'; promoCode?: string }) => void;
  onBack?: () => void;
  isProcessing?: boolean;
  showPromoInput?: boolean;
}

export function CheckoutStep({
  onPaymentSubmit,
  onBack,
  isProcessing = false,
  showPromoInput = true,
}: CheckoutStepProps) {
  const { config, bookingData, updateBookingData, goToPreviousStep } = useBooking();
  const { theme, branding } = config;

  const [promoInput, setPromoInput] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Get selected items
  const homeSize = config.homeSizes.find(h => h.id === bookingData.homeSizeId);
  const service = config.services.find(s => s.id === bookingData.serviceId);
  const frequency = config.frequencies.find(f => f.id === bookingData.frequencyId);
  const selectedAddOns = config.addOns.filter(a => bookingData.addOns.includes(a.id));

  // Parse date
  const serviceDate = bookingData.serviceDate
    ? new Date(bookingData.serviceDate + 'T12:00:00')
    : null;

  const handlePaymentOptionChange = (option: 'deposit' | 'full') => {
    updateBookingData({ paymentOption: option });
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    
    setIsValidatingPromo(true);
    setPromoError(null);

    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, accept any code
    updateBookingData({ promoCode: promoInput.toUpperCase() });
    setIsValidatingPromo(false);
  };

  const handleRemovePromo = () => {
    setPromoInput('');
    updateBookingData({ promoCode: undefined });
  };

  const handleSubmit = () => {
    if (onPaymentSubmit) {
      onPaymentSubmit({
        option: bookingData.paymentOption,
        promoCode: bookingData.promoCode,
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goToPreviousStep();
    }
  };

  // Calculate full payment discount
  const fullPaymentDiscount = config.fullPaymentDiscount
    ? Math.round(bookingData.subtotal * (config.fullPaymentDiscount / 100))
    : 0;

  const fullPaymentTotal = bookingData.total - fullPaymentDiscount;

  return (
    <div className="min-h-screen pb-32 md:pb-8" style={{ background: theme.heroGradient }}>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: theme.primaryGradient }}
          >
            <Icon name="shieldCheck" size="2xl" className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-gray-500 mt-1">Review your order and complete payment</p>
        </div>

        {/* Order Summary Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Service Details Card */}
          <Card style={{ borderColor: `${theme.primaryColor}15` }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="sparkles" size="sm" style={{ color: theme.primaryColor }} />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Type</span>
                <span className="font-medium">{service?.name || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Home Size</span>
                <span className="font-medium">{homeSize?.label || 'N/A'}</span>
              </div>
              {homeSize?.estimatedHours && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Duration</span>
                  <span className="font-medium">{homeSize.estimatedHours} hours</span>
                </div>
              )}
              {selectedAddOns.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-gray-500 text-xs">Add-ons:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAddOns.map((addOn) => (
                      <Badge key={addOn.id} variant="secondary" className="text-xs">
                        {addOn.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {frequency && frequency.id !== 'one-time' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Frequency</span>
                    <Badge
                      className="text-xs"
                      style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                    >
                      {frequency.label}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Summary Card */}
          <Card style={{ borderColor: `${theme.primaryColor}15` }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="calendar" size="sm" style={{ color: theme.primaryColor }} />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {serviceDate && bookingData.timeSlot ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Icon name="calendar" size="xs" />
                      Date
                    </span>
                    <span className="font-medium">
                      {format(serviceDate, "EEEE, MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Icon name="clock" size="xs" />
                      Time
                    </span>
                    <span className="font-medium">
                      {config.timeSlots.find(s => s.id === bookingData.timeSlot)?.label || bookingData.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Icon name="mapPin" size="xs" />
                      Location
                    </span>
                    <span className="font-medium">ZIP {bookingData.zipCode}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No schedule selected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Choose Payment Option</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Deposit Option */}
            {config.acceptDeposit && (
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  bookingData.paymentOption === 'deposit'
                    ? "ring-2 ring-opacity-30"
                    : "hover:border-gray-300"
                )}
                style={{
                  borderColor: bookingData.paymentOption === 'deposit' ? theme.primaryColor : undefined,
                  // @ts-expect-error - CSS custom property for ring color
                  '--tw-ring-color': bookingData.paymentOption === 'deposit' ? `${theme.primaryColor}50` : undefined,
                }}
                onClick={() => handlePaymentOptionChange('deposit')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">Pay Deposit</p>
                      <p className="text-sm text-gray-500">{config.depositPercent}% now, rest after service</p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        bookingData.paymentOption === 'deposit' && "border-0"
                      )}
                      style={{
                        borderColor: bookingData.paymentOption === 'deposit' ? undefined : '#d1d5db',
                        backgroundColor: bookingData.paymentOption === 'deposit' ? theme.primaryColor : undefined,
                      }}
                    >
                      {bookingData.paymentOption === 'deposit' && (
                        <Icon name="check" size="xs" className="text-white" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Due today</span>
                      <span className="font-bold" style={{ color: theme.primaryColor }}>
                        ${bookingData.deposit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Balance due after</span>
                      <span>${bookingData.balanceDue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Payment Option */}
            {config.acceptFullPayment && (
              <Card
                className={cn(
                  "cursor-pointer transition-all relative overflow-hidden",
                  bookingData.paymentOption === 'full'
                    ? "ring-2 ring-opacity-30"
                    : "hover:border-gray-300"
                )}
                style={{
                  borderColor: bookingData.paymentOption === 'full' ? theme.successColor : undefined,
                  // @ts-expect-error - CSS custom property for ring color
                  '--tw-ring-color': bookingData.paymentOption === 'full' ? `${theme.successColor}50` : undefined,
                }}
                onClick={() => handlePaymentOptionChange('full')}
              >
                {fullPaymentDiscount > 0 && (
                  <div
                    className="absolute top-2 right-2"
                  >
                    <Badge
                      className="text-xs font-bold"
                      style={{ backgroundColor: theme.successColor }}
                    >
                      Save ${fullPaymentDiscount}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">Pay in Full</p>
                      <p className="text-sm text-gray-500">
                        {fullPaymentDiscount > 0 ? `Get ${config.fullPaymentDiscount}% off` : 'No balance due'}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        bookingData.paymentOption === 'full' && "border-0"
                      )}
                      style={{
                        borderColor: bookingData.paymentOption === 'full' ? undefined : '#d1d5db',
                        backgroundColor: bookingData.paymentOption === 'full' ? theme.successColor : undefined,
                      }}
                    >
                      {bookingData.paymentOption === 'full' && (
                        <Icon name="check" size="xs" className="text-white" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Due today</span>
                      <div className="flex items-baseline gap-2">
                        {fullPaymentDiscount > 0 && (
                          <span className="text-gray-400 line-through text-xs">${bookingData.total}</span>
                        )}
                        <span className="font-bold" style={{ color: theme.successColor }}>
                          ${fullPaymentTotal}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Balance due after</span>
                      <span>$0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Promo Code */}
        {showPromoInput && (
          <Card style={{ borderColor: `${theme.primaryColor}15` }}>
            <CardContent className="p-4">
              <p className="text-sm font-medium flex items-center gap-2 mb-3">
                <Icon name="tag" size="sm" style={{ color: theme.primaryColor }} />
                Have a Promo Code?
              </p>

              {bookingData.promoCode ? (
                <div
                  className="flex items-center justify-between rounded-lg px-4 py-3"
                  style={{ backgroundColor: `${theme.successColor}10`, borderColor: `${theme.successColor}30` }}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="sparkles" size="sm" style={{ color: theme.successColor }} />
                    <span className="font-medium" style={{ color: theme.successColor }}>
                      {bookingData.promoCode}
                    </span>
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: `${theme.successColor}20`, color: theme.successColor }}
                    >
                      Applied
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemovePromo}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    className="font-mono rounded-xl"
                    maxLength={15}
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!promoInput || isValidatingPromo}
                    variant="outline"
                    className="rounded-xl"
                  >
                    {isValidatingPromo ? (
                      <Icon name="loader" size="sm" className="animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              )}
              {promoError && (
                <p className="text-sm text-red-500 mt-2">{promoError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Price Summary */}
        <Card className="shadow-lg" style={{ borderColor: `${theme.primaryColor}30`, borderWidth: '2px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="creditCard" size="lg" style={{ color: theme.primaryColor }} />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${bookingData.subtotal}</span>
              </div>
              {bookingData.discount > 0 && (
                <div className="flex justify-between text-sm" style={{ color: theme.successColor }}>
                  <span>Discount</span>
                  <span>-${bookingData.discount}</span>
                </div>
              )}
              {bookingData.paymentOption === 'full' && fullPaymentDiscount > 0 && (
                <div className="flex justify-between text-sm" style={{ color: theme.successColor }}>
                  <span>Full Payment Discount</span>
                  <span>-${fullPaymentDiscount}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                ${bookingData.paymentOption === 'full' ? fullPaymentTotal : bookingData.total}
              </span>
            </div>

            {bookingData.paymentOption === 'deposit' && (
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${theme.primaryColor}08` }}
              >
                <div className="flex justify-between text-sm">
                  <span>Due Today ({config.depositPercent}% deposit)</span>
                  <span className="font-bold">${bookingData.deposit}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Balance due after service</span>
                  <span>${bookingData.balanceDue}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl ring-2 ring-white/30"
              style={{ background: theme.primaryGradient }}
              onClick={handleSubmit}
              disabled={isProcessing || !bookingData.serviceDate}
            >
              {isProcessing ? (
                <>
                  <Icon name="loader" size="lg" className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay ${bookingData.paymentOption === 'full' ? fullPaymentTotal : bookingData.deposit} Now
                  <Icon name="arrowRight" size="lg" className="ml-2" />
                </>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-4 border-t">
              <span className="flex items-center gap-1">
                <Icon name="shieldCheck" size="xs" />
                Secure
              </span>
              <span>•</span>
              <span>256-bit Encryption</span>
              <span>•</span>
              <span>PCI Compliant</span>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={handleBack} className="text-gray-500">
            <Icon name="arrowLeft" size="sm" className="mr-2" />
            Back to Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
