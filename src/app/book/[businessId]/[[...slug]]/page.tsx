'use client';

import { use } from 'react';
import { IntegratedBookingWidget } from '@/components/booking/integrated-booking-widget';

interface PageProps {
  params: Promise<{
    businessId: string;
    slug?: string[];
  }>;
}

export default function PublicBookingPage({ params }: PageProps) {
  const { businessId } = use(params);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-violet-300/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/40 to-indigo-300/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>
      
      {/* Widget Container */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
        <IntegratedBookingWidget businessId={businessId} />
      </div>
    </main>
  );
}
