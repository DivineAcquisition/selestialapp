'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { BookingProgressBar } from '@/components/booking/v2/BookingProgressBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBooking } from '@/contexts/BookingFlowContext';

/**
 * Step 5 — Address + scheduling (collected post-payment).
 * Layout, fields, and time-block options ported from
 * AlphaLuxClean (`src/pages/book/Details.tsx`).
 */
export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;
  const searchParams = useSearchParams();
  const { bookingData } = useBooking();

  const bookingId = searchParams.get('booking_id') || bookingData.bookingId;

  const [loading, setLoading] = useState(false);
  const [addressLine1, setAddressLine1] = useState(bookingData.contactInfo.address1 || '');
  const [addressLine2, setAddressLine2] = useState(bookingData.contactInfo.address2 || '');
  const [city, setCity] = useState(bookingData.contactInfo.city || bookingData.city || '');
  const [stateField, setStateField] = useState(
    bookingData.contactInfo.state || bookingData.state || ''
  );
  const [zipCode, setZipCode] = useState(bookingData.contactInfo.zip || bookingData.zipCode || '');
  const [preferredDate, setPreferredDate] = useState(bookingData.date || '');
  const [preferredTimeBlock, setPreferredTimeBlock] = useState(bookingData.timeSlot || '');
  const [notes, setNotes] = useState(bookingData.specialInstructions || '');

  useEffect(() => {
    if (!bookingId) {
      toast.error('No booking found');
      router.replace(`/book/${businessId}/zip`);
    }
  }, [bookingId, businessId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine1 || !city || !stateField || !zipCode || !preferredDate || !preferredTimeBlock) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/booking/${businessId}/save-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          state: stateField,
          zipCode,
          serviceDate: preferredDate,
          timeSlot: preferredTimeBlock,
          specialInstructions: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to save details');
      }
      toast.success('Booking confirmed!');
      router.push(`/book/${businessId}/confirmation?booking_id=${bookingId}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update booking details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BookingProgressBar currentStep={5} totalSteps={6} />

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Almost done — let&apos;s schedule your clean
          </h1>
          <p className="text-lg text-muted-foreground">
            We have your payment. Now let&apos;s get your home details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Service Address</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input
                  id="address1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt, Suite, Unit (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={stateField}
                    onChange={(e) => setStateField(e.target.value)}
                    maxLength={2}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input id="zip" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Preferred Scheduling
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="timeBlock">Preferred Time Block *</Label>
                <Select value={preferredTimeBlock} onValueChange={setPreferredTimeBlock} required>
                  <SelectTrigger id="timeBlock">
                    <SelectValue placeholder="Select a time window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8–11 AM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12–3 PM)</SelectItem>
                    <SelectItem value="evening">Evening (3–6 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Additional Notes</h2>
            <Label htmlFor="notes">Anything we should know before arriving?</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gate code, pets, parking instructions, special requests..."
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Optional: Let us know about pets, access codes, or any special instructions.
            </p>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Completing booking…' : 'Complete Booking'}
          </Button>
        </form>
      </div>
    </div>
  );
}
