'use client';

import { use } from 'react';
import { ModernBookingWidget } from '@/components/booking/modern-booking-widget';

interface PageProps {
  params: Promise<{
    businessId: string;
    slug?: string[];
  }>;
}

export default function PublicBookingPage({ params }: PageProps) {
  const { businessId } = use(params);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-violet-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-violet-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-blue-300/30 to-indigo-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-200/20 to-transparent rounded-full" />
      </div>
      
      {/* Widget Container */}
      <div className="relative z-10 py-8 md:py-12 lg:py-16 min-h-screen flex items-center">
        <ModernBookingWidget businessId={businessId} />
      </div>
      
      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-gray-400 bg-gradient-to-t from-white via-white to-transparent">
        Powered by <span className="font-semibold text-gray-500">Selestial</span>
      </div>
    </main>
  );
}
