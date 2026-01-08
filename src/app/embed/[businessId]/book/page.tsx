'use client';

import { use } from 'react';
import { CleaningBookingWidget } from '@/components/booking/cleaning-booking-widget';

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default function EmbedBookingPage({ params }: PageProps) {
  const { businessId } = use(params);
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <CleaningBookingWidget businessId={businessId} />
    </div>
  );
}
