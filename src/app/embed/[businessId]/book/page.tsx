'use client';

import { use, useState, useEffect } from 'react';
import { ResponsiveBookingWidget } from '@/components/booking/responsive-booking-widget';

interface PageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ theme?: string; state?: string }>;
}

export default function EmbedBookingPage({ params, searchParams }: PageProps) {
  const { businessId } = use(params);
  const { theme = 'light', state = 'TX' } = use(searchParams);
  const [businessName, setBusinessName] = useState('Cleaning Service');
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  
  // Fetch business details
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const response = await fetch(`/api/booking/${businessId}/config`);
        if (response.ok) {
          const data = await response.json();
          if (data.business?.name) {
            setBusinessName(data.business.name);
          }
          if (data.config?.primary_color) {
            setPrimaryColor(data.config.primary_color);
          }
        }
      } catch (error) {
        console.error('Failed to fetch business details:', error);
      }
    };
    
    fetchBusinessDetails();
  }, [businessId]);
  
  const handleComplete = async (data: unknown) => {
    console.log('Booking completed:', data);
    // Handle booking submission
    try {
      const response = await fetch(`/api/booking/${businessId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // Could redirect to success page or show confirmation
        alert('Booking submitted successfully!');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
    }
  };
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} p-4 sm:p-6 md:p-8 flex items-center justify-center`}>
      <ResponsiveBookingWidget 
        businessId={businessId}
        businessName={businessName}
        stateCode={state}
        primaryColor={primaryColor}
        onComplete={handleComplete}
      />
    </div>
  );
}
