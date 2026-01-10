'use client';

import { use, useState, useEffect } from 'react';
import { AceternetyBookingWidget } from '@/components/booking/aceternity-booking-widget';

interface PageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ theme?: string; state?: string; style?: string }>;
}

export default function EmbedBookingPage({ params, searchParams }: PageProps) {
  const { businessId } = use(params);
  const { theme = 'light', state = 'TX' } = use(searchParams);
  const [businessName, setBusinessName] = useState('Cleaning Service');
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  
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
      } finally {
        setIsLoaded(true);
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-purple-50'} p-4 sm:p-6 md:p-8 flex items-center justify-center`}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-primary/20 rounded-full blur-3xl" />
      </div>
      
      {/* Widget */}
      <div className={`relative z-10 w-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <AceternetyBookingWidget 
          businessId={businessId}
          businessName={businessName}
          stateCode={state}
          primaryColor={primaryColor}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
