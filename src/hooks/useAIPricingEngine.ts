'use client';

import { useState, useCallback } from 'react';
import type { PricingBreakdown, PricingInput } from '@/lib/booking/ai-pricing-engine';

interface UseAIPricingEngineOptions {
  businessId: string;
  debounceMs?: number;
}

interface UseAIPricingEngineReturn {
  breakdown: PricingBreakdown | null;
  loading: boolean;
  error: string | null;
  calculatePrice: (input: Partial<PricingInput>) => Promise<PricingBreakdown | null>;
  quickEstimate: (bedrooms: number, bathrooms: number, serviceType?: string, frequency?: string) => Promise<{ min: number; max: number; average: number } | null>;
}

export function useAIPricingEngine({ businessId, debounceMs = 300 }: UseAIPricingEngineOptions): UseAIPricingEngineReturn {
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePrice = useCallback(async (input: Partial<PricingInput>): Promise<PricingBreakdown | null> => {
    if (!businessId) {
      setError('Business ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/booking/${businessId}/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          bedrooms: input.bedrooms ?? 2,
          bathrooms: input.bathrooms ?? 1,
          halfBaths: input.halfBaths,
          squareFootage: input.squareFootage,
          homeType: input.homeType,
          floors: input.floors,
          serviceType: input.serviceType ?? 'standard',
          frequency: input.frequency ?? 'one_time',
          addons: input.addons,
          pets: input.pets,
          lastCleanedDays: input.lastCleanedDays,
          clutterLevel: input.clutterLevel,
          hasHighCeilings: input.hasHighCeilings,
          stairFlights: input.stairFlights,
          zipCode: input.zipCode,
          requestedDate: input.requestedDate,
          requestedTime: input.requestedTime,
          hoursNotice: input.hoursNotice,
          isNewCustomer: input.isNewCustomer,
          isFirstBooking: input.isFirstBooking,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate price');
      }

      const data = await response.json();
      setBreakdown(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const quickEstimate = useCallback(async (
    bedrooms: number,
    bathrooms: number,
    serviceType: string = 'standard',
    frequency: string = 'one_time'
  ): Promise<{ min: number; max: number; average: number } | null> => {
    if (!businessId) {
      setError('Business ID is required');
      return null;
    }

    try {
      const params = new URLSearchParams({
        bedrooms: bedrooms.toString(),
        bathrooms: bathrooms.toString(),
        serviceType,
        frequency,
      });

      const response = await fetch(`/api/booking/${businessId}/pricing/calculate?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to get estimate');
      }

      const data = await response.json();
      return data.estimate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [businessId]);

  return {
    breakdown,
    loading,
    error,
    calculatePrice,
    quickEstimate,
  };
}

// Utility type for building pricing input incrementally
export interface PricingInputBuilder {
  // Property
  bedrooms?: number;
  bathrooms?: number;
  halfBaths?: number;
  squareFootage?: number;
  homeType?: string;
  floors?: number;
  
  // Service
  serviceType?: string;
  frequency?: string;
  
  // Add-ons
  addons?: Array<{ slug: string; quantity: number }>;
  
  // Conditions
  pets?: { count: number; shedding?: 'low' | 'medium' | 'heavy' };
  lastCleanedDays?: number;
  clutterLevel?: 'none' | 'light' | 'moderate' | 'heavy';
  hasHighCeilings?: boolean;
  stairFlights?: number;
  
  // Location & Time
  zipCode?: string;
  requestedDate?: string;
  requestedTime?: string;
  hoursNotice?: number;
  
  // Customer
  isNewCustomer?: boolean;
  isFirstBooking?: boolean;
}

// Helper to convert booking widget form data to pricing input
export function formDataToPricingInput(
  formData: {
    bedrooms?: number;
    bathrooms?: number;
    halfBaths?: number;
    sqft?: number;
    serviceType?: string;
    frequency?: string;
    selectedAddons?: Array<{ slug: string; quantity: number }>;
    hasPets?: boolean;
    petCount?: number;
    lastCleaned?: string;
    clutterLevel?: string;
    zipCode?: string;
    date?: string;
    time?: string;
  }
): PricingInputBuilder {
  // Calculate last cleaned days
  let lastCleanedDays: number | undefined;
  if (formData.lastCleaned) {
    switch (formData.lastCleaned) {
      case 'never':
        lastCleanedDays = 365;
        break;
      case '6_months':
        lastCleanedDays = 180;
        break;
      case '3_months':
        lastCleanedDays = 90;
        break;
      case '1_month':
        lastCleanedDays = 30;
        break;
      case '2_weeks':
        lastCleanedDays = 14;
        break;
      default:
        lastCleanedDays = undefined;
    }
  }

  // Calculate hours notice
  let hoursNotice: number | undefined;
  if (formData.date) {
    const requestedDate = new Date(formData.date);
    const now = new Date();
    hoursNotice = Math.max(0, (requestedDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  }

  return {
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    halfBaths: formData.halfBaths,
    squareFootage: formData.sqft,
    serviceType: formData.serviceType,
    frequency: formData.frequency,
    addons: formData.selectedAddons,
    pets: formData.hasPets && formData.petCount ? {
      count: formData.petCount,
    } : undefined,
    lastCleanedDays,
    clutterLevel: formData.clutterLevel as PricingInputBuilder['clutterLevel'],
    zipCode: formData.zipCode,
    requestedDate: formData.date,
    requestedTime: formData.time,
    hoursNotice,
  };
}

export default useAIPricingEngine;
