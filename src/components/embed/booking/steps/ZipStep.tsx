"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBooking } from "../BookingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface ZipStepProps {
  onContinue?: () => void;
}

type FormMode = 'zip' | 'contact' | 'waitlist' | 'waitlist-success';

export function ZipStep({ onContinue }: ZipStepProps) {
  const { config, bookingData, updateBookingData, goToNextStep } = useBooking();
  const { branding, theme } = config;
  
  const [formMode, setFormMode] = useState<FormMode>('zip');
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingData.zipCode.length !== 5) return;

    setIsValidating(true);

    // Check if ZIP is in service area
    const inServiceArea =
      config.serviceZipCodes.length === 0 ||
      config.serviceZipCodes.includes(bookingData.zipCode);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsValidating(false);

    if (inServiceArea) {
      updateBookingData({ inServiceArea: true });
      if (config.captureContactFirst) {
        setFormMode('contact');
      } else {
        goToNextStep();
      }
    } else if (config.waitlistEnabled) {
      updateBookingData({ inServiceArea: false });
      setFormMode('waitlist');
    } else {
      // Show not in service area message
      updateBookingData({ inServiceArea: false });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.firstName) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsSubmitting(false);
    
    if (onContinue) {
      onContinue();
    } else {
      goToNextStep();
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setFormMode('waitlist-success');
  };

  const handleChangeZip = () => {
    setFormMode('zip');
    updateBookingData({ zipCode: '', inServiceArea: false });
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length > 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      return `(${digits}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen" style={{ background: theme.heroGradient }}>
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
              {formMode === 'waitlist-success'
                ? "You're On The List! 🎉"
                : config.promo.enabled
                  ? config.promo.headline
                  : `Book Your ${branding.businessName} Today`}
            </h1>

            {formMode !== 'waitlist-success' && (
              <p className="text-gray-600 text-sm md:text-base">
                {formMode === 'waitlist'
                  ? "We're not in your area yet, but we're expanding soon!"
                  : "Premium service at transparent prices. Enter your ZIP code to get started."}
              </p>
            )}
          </div>

          {/* Main Card */}
          <Card className="border-2 shadow-lg" style={{ borderColor: `${theme.primaryColor}30` }}>
            <CardContent className="pt-8 pb-8 space-y-6">
              {/* ZIP Code Form */}
              {formMode === 'zip' && (
                <form onSubmit={handleZipSubmit} className="space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium text-left block">
                      Enter Your ZIP Code
                    </label>
                    <Input
                      id="zipCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      placeholder="12345"
                      value={bookingData.zipCode}
                      onChange={e => updateBookingData({ zipCode: e.target.value.replace(/\D/g, '') })}
                      className="h-14 text-lg text-center rounded-xl"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500">
                      We'll check if we service your area
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={bookingData.zipCode.length !== 5 || isValidating}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl ring-2 ring-white/30"
                    style={{ background: theme.primaryGradient }}
                  >
                    {isValidating ? "Checking..." : "Continue"}
                    <Icon name="arrowRight" size="lg" className="ml-2" />
                  </Button>
                </form>
              )}

              {/* Contact Details Form */}
              {formMode === 'contact' && (
                <form onSubmit={handleContactSubmit} className="space-y-5 animate-in fade-in">
                  {/* Success Message */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Icon name="checkCircle" size="lg" className="text-emerald-500 mt-0.5" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Great news! We service your area
                      </p>
                      <p className="text-sm text-gray-500">
                        Enter your details to continue
                      </p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-left block">
                        First Name
                      </label>
                      <Input
                        type="text"
                        placeholder="John"
                        value={bookingData.firstName}
                        onChange={e => updateBookingData({ firstName: e.target.value })}
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-left block">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Smith"
                        value={bookingData.lastName}
                        onChange={e => updateBookingData({ lastName: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-left block">
                      Email {config.requireEmail && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={bookingData.email}
                      onChange={e => updateBookingData({ email: e.target.value })}
                      className="h-12 rounded-xl"
                      required={config.requireEmail}
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-left block">
                      Phone {config.requirePhone && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={bookingData.phone}
                      onChange={e => updateBookingData({ phone: formatPhoneInput(e.target.value) })}
                      className="h-12 rounded-xl"
                      required={config.requirePhone}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={!bookingData.firstName || isSubmitting}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl ring-2 ring-white/30"
                    style={{ background: theme.primaryGradient }}
                  >
                    {isSubmitting ? "Processing..." : "Continue →"}
                  </Button>

                  <button
                    type="button"
                    onClick={handleChangeZip}
                    className="text-sm hover:underline underline-offset-2"
                    style={{ color: theme.primaryColor }}
                  >
                    ← Change ZIP code ({bookingData.zipCode})
                  </button>
                </form>
              )}

              {/* Waitlist Form */}
              {formMode === 'waitlist' && (
                <form onSubmit={handleWaitlistSubmit} className="space-y-5 animate-in fade-in">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Icon name="mapPin" size="lg" className="text-amber-600 mt-0.5" />
                    <div className="text-left">
                      <p className="font-semibold text-amber-800">
                        We're not in {bookingData.zipCode} yet
                      </p>
                      <p className="text-sm text-amber-700">
                        But we're expanding to your area soon! Join our waitlist.
                      </p>
                    </div>
                  </div>

                  {/* Waitlist benefits */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-900">Waitlist perks:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {['First to know when we launch', 'Exclusive early-bird pricing', 'Founding member perks'].map((perk, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Icon name="check" size="sm" style={{ color: theme.primaryColor }} />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Name & contact fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={bookingData.firstName}
                      onChange={e => updateBookingData({ firstName: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={bookingData.lastName}
                      onChange={e => updateBookingData({ lastName: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={bookingData.email}
                    onChange={e => updateBookingData({ email: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={bookingData.phone}
                    onChange={e => updateBookingData({ phone: formatPhoneInput(e.target.value) })}
                    className="h-12 rounded-xl"
                  />

                  <Button
                    type="submit"
                    size="lg"
                    disabled={!bookingData.firstName || !bookingData.email || isSubmitting}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl ring-2 ring-white/30"
                    style={{ background: theme.primaryGradient }}
                  >
                    {isSubmitting ? "Adding to Waitlist..." : "Join the Waitlist"}
                    <Icon name="clock" size="lg" className="ml-2" />
                  </Button>

                  <button
                    type="button"
                    onClick={handleChangeZip}
                    className="text-sm hover:underline underline-offset-2"
                    style={{ color: theme.primaryColor }}
                  >
                    ← Try a different ZIP code
                  </button>
                </form>
              )}

              {/* Waitlist Success */}
              {formMode === 'waitlist-success' && (
                <div className="space-y-6 animate-in fade-in text-center py-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: `${theme.primaryColor}15` }}
                  >
                    <Icon name="check" size="3xl" style={{ color: theme.primaryColor }} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Thanks for joining, {bookingData.firstName}!
                    </h2>
                    <p className="text-gray-500">
                      We've added you to our waitlist for ZIP code {bookingData.zipCode}.
                      You'll be the first to know when we start servicing your area.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
                    <p>📧 Check your email for a confirmation</p>
                    <p className="mt-1">We'll reach out soon!</p>
                  </div>

                  <Button
                    onClick={handleChangeZip}
                    variant="outline"
                    className="mt-4 rounded-xl"
                  >
                    Check Another ZIP Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust badges */}
          {config.trustBadges.filter(b => b.enabled).length > 0 && formMode !== 'waitlist-success' && (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {config.trustBadges.filter(b => b.enabled).map(badge => (
                <div
                  key={badge.id}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-full bg-white"
                  style={{ borderColor: theme.successColor }}
                >
                  <Icon name="shieldCheck" size="sm" style={{ color: theme.successColor }} />
                  <span className="text-sm font-medium" style={{ color: theme.successColor }}>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
