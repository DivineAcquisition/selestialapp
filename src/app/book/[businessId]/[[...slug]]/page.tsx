'use client';

import { use, useState, useEffect } from 'react';
import { AceternetyBookingWidget } from '@/components/booking/aceternity-booking-widget';
import { supabase } from '@/integrations/supabase/client';

interface PageProps {
  params: Promise<{
    businessId: string;
    slug?: string[];
  }>;
}

export default function PublicBookingPage({ params }: PageProps) {
  const { businessId } = use(params);
  const [businessName, setBusinessName] = useState('Cleaning Service');
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Fetch business details
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        // Try to fetch custom config
        const { data: configData } = await (supabase as any)
          .from('booking_widget_configs')
          .select('*')
          .eq('business_id', businessId)
          .single();
        
        if (configData?.config) {
          if (configData.config.businessName) setBusinessName(configData.config.businessName);
          if (configData.config.primaryColor) setPrimaryColor(configData.config.primaryColor);
          if (configData.config.phone) setPhone(configData.config.phone);
        } else {
          // Fallback to business details
          const { data: business } = await (supabase as any)
            .from('businesses')
            .select('name, phone')
            .eq('id', businessId)
            .single();
          
          if (business?.name) setBusinessName(business.name);
          if (business?.phone) setPhone(business.phone);
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
    try {
      const response = await fetch(`/api/booking/${businessId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // Show success or redirect
        alert('Booking submitted successfully!');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* Widget Container */}
      <div className={`relative z-10 p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <AceternetyBookingWidget 
          businessId={businessId}
          businessName={businessName}
          stateCode="TX"
          primaryColor={primaryColor}
          onComplete={handleComplete}
        />
      </div>
    </main>
  );
}
