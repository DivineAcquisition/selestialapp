'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { BookingProgressBar } from '@/components/booking/v2/BookingProgressBar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBooking } from '@/contexts/BookingFlowContext';
import { useBookingTenant } from '@/contexts/BookingTenantContext';
import { formatPhoneNumber, digitsOnly } from '@/lib/booking/format';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

/**
 * Step 1 — ZIP + lead capture.
 * Layout, behavior, and copy are ported from
 * AlphaLuxClean (`src/pages/book/Zip.tsx`).
 */
export default function BookZipPage() {
  const router = useRouter();
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;
  const { tenant } = useBookingTenant();
  const { updateBookingData } = useBooking();

  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');
  const [isValidatingZip, setIsValidatingZip] = useState(false);
  const [zipValidated, setZipValidated] = useState(false);
  const [validatedLocation, setValidatedLocation] = useState<{ city: string; state: string } | null>(
    null
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = (path: string) => router.push(`/book/${businessId}${path}`);

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
    setZipError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(formatPhoneNumber(value));
    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleCheckAvailability = async () => {
    if (zipCode.length !== 5) {
      setZipError('Please enter a valid 5-digit ZIP code');
      return;
    }
    setIsValidatingZip(true);
    setZipError('');

    try {
      const res = await fetch(`/api/booking/${businessId}/validate-zip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode }),
      });
      const data = await res.json();
      if (data?.isValid) {
        setValidatedLocation({ city: data.city, state: data.state });
        setZipValidated(true);
        updateBookingData({ zipCode, city: data.city, state: data.state });
      } else {
        setZipError(data?.message || "We don't service this area yet.");
      }
    } catch (err) {
      console.error('ZIP validation error:', err);
      setZipError('Failed to validate ZIP code. Please try again.');
    } finally {
      setIsValidatingZip(false);
    }
  };

  const handleZipKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && zipCode.length === 5) handleCheckAvailability();
  };

  const validateLeadForm = (): boolean => {
    try {
      leadSchema.parse({ firstName, lastName, email, phone: digitsOnly(phone) });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) errors[err.path[0] as string] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmitLead = async () => {
    if (!validateLeadForm()) return;
    setIsSubmitting(true);

    try {
      const cleanPhone = digitsOnly(phone);
      const res = await fetch(`/api/booking/${businessId}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: `+1${cleanPhone}`,
          zipCode,
          city: validatedLocation?.city,
          state: validatedLocation?.state,
          step: 'lead_captured',
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          landingPage: typeof window !== 'undefined' ? window.location.href : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Lead capture failed (${res.status})`);
      }
      toast.success('Information saved! Taking you to the next step...');
    } catch (err) {
      console.error('Lead capture error:', err);
      toast.error('There was an issue saving your info, but you can still continue.');
    }

    updateBookingData({
      contactInfo: {
        firstName,
        lastName,
        email,
        phone: formatPhoneNumber(digitsOnly(phone)),
        address1: '',
        address2: '',
        city: validatedLocation?.city || '',
        state: validatedLocation?.state || '',
        zip: zipCode,
      },
    });

    setIsSubmitting(false);
    setTimeout(() => next('/sqft'), 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BookingProgressBar currentStep={1} totalSteps={6} />

      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-5xl font-bold mb-3 leading-tight">
              {tenant?.name ?? 'Selestial'} —
              <span className="block text-primary mt-2">
                Book your cleaning in 60 seconds
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Enter your ZIP to check availability and see instant pricing.
            </p>
          </div>

          <Card className="p-6 md:p-8">
            {!zipValidated ? (
              // Phase 1: ZIP entry
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zip" className="text-base mb-2 block">
                    ZIP Code
                  </Label>
                  <Input
                    id="zip"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="75001"
                    value={zipCode}
                    onChange={handleZipChange}
                    onKeyDown={handleZipKeyPress}
                    className="text-lg md:text-2xl text-center h-12 md:h-16 tracking-wider"
                    autoFocus
                    disabled={isValidatingZip}
                  />
                </div>
                {zipError && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-center">{zipError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleCheckAvailability}
                  size="lg"
                  className="w-full h-12 md:h-14 text-base md:text-lg"
                  disabled={zipCode.length !== 5 || isValidatingZip}
                >
                  {isValidatingZip ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking availability...
                    </>
                  ) : (
                    'Check Availability'
                  )}
                </Button>
              </div>
            ) : (
              // Phase 2: Lead capture
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 mb-2 text-sm text-emerald-800">
                  Great news — we service{' '}
                  <strong>
                    {validatedLocation?.city}, {validatedLocation?.state}
                  </strong>
                  . Tell us who you are to continue.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="mb-1 block">
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Sarah"
                    />
                    {formErrors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="mb-1 block">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Johnson"
                    />
                    {formErrors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="mb-1 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-1 block">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <Button
                  onClick={handleSubmitLead}
                  size="lg"
                  className="w-full h-12 md:h-14 text-base md:text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Continue →'
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
