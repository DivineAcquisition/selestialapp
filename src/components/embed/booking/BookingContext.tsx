"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  BookingWidgetConfig,
  BookingData,
  BookingContextValue,
  BookingFlowStep,
  INITIAL_BOOKING_DATA,
} from './types';

const BookingContext = createContext<BookingContextValue | null>(null);

interface BookingProviderProps {
  config: BookingWidgetConfig;
  children: React.ReactNode;
  persistKey?: string; // Optional key for localStorage persistence
}

export function BookingProvider({ config, children, persistKey }: BookingProviderProps) {
  // Initialize booking data from localStorage if persistKey is provided
  const [bookingData, setBookingData] = useState<BookingData>(() => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        try {
          return { ...INITIAL_BOOKING_DATA, ...JSON.parse(saved) };
        } catch {
          return INITIAL_BOOKING_DATA;
        }
      }
    }
    return INITIAL_BOOKING_DATA;
  });

  const [currentStep, setCurrentStepState] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist booking data to localStorage
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(persistKey, JSON.stringify(bookingData));
    }
  }, [bookingData, persistKey]);

  // Get current step ID
  const currentStepId = useMemo(() => {
    return config.flowSteps[currentStep] || config.flowSteps[0];
  }, [config.flowSteps, currentStep]);

  // Total steps
  const totalSteps = config.flowSteps.length;

  // Progress percentage
  const progressPercent = useMemo(() => {
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  }, [currentStep, totalSteps]);

  // Calculate pricing whenever booking data changes
  const calculatePricing = useCallback((data: BookingData): Partial<BookingData> => {
    const homeSize = config.homeSizes.find(h => h.id === data.homeSizeId);
    const service = config.services.find(s => s.id === data.serviceId);
    const frequency = config.frequencies.find(f => f.id === data.frequencyId);
    
    if (!homeSize || !service) {
      return { subtotal: 0, discount: 0, deposit: 0, total: 0, balanceDue: 0 };
    }

    // Base price from home size + service add-on
    let subtotal = homeSize.basePrice + (service.basePrice || 0);

    // Add add-ons
    data.addOns.forEach(addOnId => {
      const addOn = config.addOns.find(a => a.id === addOnId);
      if (addOn) {
        subtotal += addOn.price;
      }
    });

    // Apply frequency discount
    let discount = 0;
    if (frequency && frequency.discountPercent > 0) {
      discount = Math.round(subtotal * (frequency.discountPercent / 100));
    }

    // Apply promo discount if service has one
    if (service.discountPrice !== undefined) {
      discount += (homeSize.basePrice + (service.basePrice || 0)) - service.discountPrice;
    }

    // Apply full payment discount
    if (data.paymentOption === 'full' && config.fullPaymentDiscount) {
      discount += Math.round((subtotal - discount) * (config.fullPaymentDiscount / 100));
    }

    const total = Math.max(subtotal - discount, config.minimumPrice || 0);
    const deposit = Math.round(total * (config.depositPercent / 100));
    const balanceDue = total - deposit;

    return {
      subtotal,
      discount,
      deposit,
      total,
      balanceDue,
    };
  }, [config]);

  // Update booking data
  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData(prev => {
      const updated = { ...prev, ...data };
      // Recalculate pricing if relevant fields changed
      if (
        data.homeSizeId !== undefined ||
        data.serviceId !== undefined ||
        data.frequencyId !== undefined ||
        data.addOns !== undefined ||
        data.paymentOption !== undefined
      ) {
        const pricing = calculatePricing(updated);
        return { ...updated, ...pricing };
      }
      return updated;
    });
  }, [calculatePricing]);

  // Reset booking data
  const resetBookingData = useCallback(() => {
    setBookingData(INITIAL_BOOKING_DATA);
    setCurrentStepState(0);
    setError(null);
    if (persistKey && typeof window !== 'undefined') {
      localStorage.removeItem(persistKey);
    }
  }, [persistKey]);

  // Step navigation
  const setCurrentStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStepState(step);
      setError(null);
    }
  }, [totalSteps]);

  // Validation for each step
  const validateStep = useCallback((stepId: BookingFlowStep): boolean => {
    switch (stepId) {
      case 'zip':
        return bookingData.zipCode.length === 5;
      case 'contact':
        const hasName = bookingData.firstName.trim().length > 0;
        const hasEmail = !config.requireEmail || bookingData.email.trim().length > 0;
        const hasPhone = !config.requirePhone || bookingData.phone.replace(/\D/g, '').length >= 10;
        return hasName && hasEmail && hasPhone;
      case 'home-size':
        return bookingData.homeSizeId.length > 0;
      case 'service':
        return bookingData.serviceId.length > 0;
      case 'addons':
        return true; // Add-ons are optional
      case 'schedule':
        return bookingData.serviceDate.length > 0 && bookingData.timeSlot.length > 0;
      case 'checkout':
        return bookingData.total > 0;
      case 'details':
        return bookingData.address ? bookingData.address.length > 0 : true;
      case 'confirmation':
        return true;
      default:
        return true;
    }
  }, [bookingData, config.requireEmail, config.requirePhone]);

  // Can go to next step
  const canGoNext = useMemo(() => {
    return validateStep(currentStepId) && currentStep < totalSteps - 1;
  }, [validateStep, currentStepId, currentStep, totalSteps]);

  // Can go back
  const canGoBack = currentStep > 0;

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStepState(prev => prev + 1);
      setError(null);
    }
  }, [canGoNext]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (canGoBack) {
      setCurrentStepState(prev => prev - 1);
      setError(null);
    }
  }, [canGoBack]);

  const value: BookingContextValue = {
    config,
    bookingData,
    updateBookingData,
    resetBookingData,
    currentStep,
    currentStepId,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
    totalSteps,
    progressPercent,
    isLoading,
    isProcessing,
    error,
    setError,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

// Hook to access just the config
export function useBookingConfig() {
  const { config } = useBooking();
  return config;
}

// Hook to access booking data and updater
export function useBookingData() {
  const { bookingData, updateBookingData, resetBookingData } = useBooking();
  return { bookingData, updateBookingData, resetBookingData };
}

// Hook for step navigation
export function useBookingNavigation() {
  const {
    currentStep,
    currentStepId,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
    totalSteps,
    progressPercent,
  } = useBooking();
  
  return {
    currentStep,
    currentStepId,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
    totalSteps,
    progressPercent,
  };
}
