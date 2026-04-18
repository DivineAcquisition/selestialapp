'use client';

/**
 * Selestial booking-flow context.
 *
 * Ported from AlphaLuxClean (`src/contexts/BookingContext.tsx`). Same shape,
 * same persistence pattern, same dynamic 25% deposit, same skip-on-offer-set
 * recalc rule. The only Selestial-specific change is that localStorage is
 * namespaced per-tenant (`selestial-booking-flow:{businessId}`) so multiple
 * tenants can be open in the same browser without cross-contaminating data.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { calculateNewPricing, type PricingResult } from '@/lib/booking/pricing';

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface BookingData {
  // Step 1: ZIP
  zipCode: string;
  city: string;
  state: string;

  // Step 2: Home size
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  homeSizeId?: string;
  homeType: 'house' | 'apartment' | 'condo';

  // Step 3: Offer
  offerType?: 'deep_clean' | 'recurring' | 'tester_deep_clean' | '90_day_plan' | 'standard_clean';
  offerName?: string;
  basePrice?: number;
  visitCount?: number;
  isRecurring?: boolean;

  // Promo
  promoCode?: string;
  promoDiscount?: number;

  // Service / frequency
  serviceType: 'regular' | 'deep' | 'move_in_out';
  frequency: 'one_time' | 'weekly' | 'bi_weekly' | 'monthly';

  // Step 5: Schedule (collected post-payment in Details)
  date: string;
  timeSlot: string;
  bookingExpiresAt?: number;

  // Post-payment tracking
  additionalDetailsCollected?: boolean;
  bookingId?: string;

  // Optional (kept for compatibility with ALC summary/upsell components)
  recurringStartDate?: string;
  upgradedToRecurring?: boolean;
  recurringUpgradeDiscount?: number;

  // Contact + payment
  contactInfo: ContactInfo;
  specialInstructions: string;
  joinMembership: boolean;
}

interface BookingContextType {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  clearBookingData: () => void;
  pricing: PricingResult | null;
  calculatePricing: () => void;
  depositAmount: number;
  businessId: string;
}

const defaultContactInfo: ContactInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
};

const defaultBookingData: BookingData = {
  zipCode: '',
  city: '',
  state: '',
  bedrooms: 2,
  bathrooms: 2,
  sqft: 0,
  homeSizeId: '2001_2500',
  homeType: 'house',
  serviceType: 'deep',
  frequency: 'one_time',
  date: '',
  timeSlot: '',
  bookingExpiresAt: undefined,
  contactInfo: defaultContactInfo,
  specialInstructions: '',
  joinMembership: false,
};

const STORAGE_KEY_PREFIX = 'selestial-booking-flow';
const DEPOSIT_PERCENTAGE = 0.25;

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({
  businessId,
  children,
}: {
  businessId: string;
  children: ReactNode;
}) {
  const storageKey = `${STORAGE_KEY_PREFIX}:${businessId}`;

  const [bookingData, setBookingData] = useState<BookingData>(() => {
    if (typeof window === 'undefined') return defaultBookingData;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        return { ...defaultBookingData, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load booking data:', error);
    }
    return defaultBookingData;
  });

  const depositAmount = bookingData.basePrice
    ? Math.round(bookingData.basePrice * DEPOSIT_PERCENTAGE)
    : 0;

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(bookingData));
    } catch (error) {
      console.error('Failed to save booking data:', error);
    }
  }, [bookingData, storageKey]);

  // Derive pricing from booking state. AlphaLuxClean used setState inside an
  // effect; React 19 considers that an anti-pattern. We compute synchronously
  // via useMemo and expose the same `pricing` and `calculatePricing` API so
  // callers don't need to change.
  const pricing = useMemo<PricingResult | null>(() => {
    try {
      if (bookingData.offerType) return null; // an offer locks the price
      if (!bookingData.state || !bookingData.serviceType || !bookingData.frequency) return null;

      let homeSizeId = bookingData.homeSizeId || '2001_2500';
      if (!bookingData.homeSizeId) {
        const sqft = bookingData.sqft;
        const bedrooms = bookingData.bedrooms;
        if (sqft > 0) {
          if (sqft >= 1000 && sqft <= 1500) homeSizeId = '1000_1500';
          else if (sqft >= 1501 && sqft <= 2000) homeSizeId = '1501_2000';
          else if (sqft >= 2001 && sqft <= 2500) homeSizeId = '2001_2500';
          else if (sqft >= 2501 && sqft <= 3000) homeSizeId = '2501_3000';
          else if (sqft >= 3001 && sqft <= 4000) homeSizeId = '3001_4000';
          else if (sqft >= 4001 && sqft <= 5000) homeSizeId = '4001_5000';
          else if (sqft >= 5000) homeSizeId = '5001_plus';
          else if (sqft < 1000) homeSizeId = '1000_1500';
        } else if (bedrooms > 0) {
          if (bedrooms <= 1) homeSizeId = '1000_1500';
          else if (bedrooms === 2) homeSizeId = '1501_2000';
          else if (bedrooms === 3) homeSizeId = '2001_2500';
          else if (bedrooms === 4) homeSizeId = '2501_3000';
          else homeSizeId = '3001_4000';
        }
      }

      return calculateNewPricing(
        homeSizeId,
        bookingData.serviceType,
        bookingData.frequency,
        bookingData.state || 'TX'
      );
    } catch (error) {
      console.error('Pricing calculation error:', error);
      return null;
    }
  }, [
    bookingData.offerType,
    bookingData.state,
    bookingData.bedrooms,
    bookingData.sqft,
    bookingData.serviceType,
    bookingData.frequency,
    bookingData.homeSizeId,
  ]);

  // Kept for API parity with the AlphaLuxClean BookingContext consumers.
  const calculatePricing = useCallback(() => {
    /* pricing is derived in useMemo above; this is a no-op for compat */
  }, []);

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  }, []);

  const clearBookingData = useCallback(() => {
    setBookingData(defaultBookingData);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const value = useMemo<BookingContextType>(
    () => ({
      bookingData,
      updateBookingData,
      clearBookingData,
      pricing,
      calculatePricing,
      depositAmount,
      businessId,
    }),
    [bookingData, updateBookingData, clearBookingData, pricing, calculatePricing, depositAmount, businessId]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextType {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
