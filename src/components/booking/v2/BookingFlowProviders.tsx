'use client';

import type { ReactNode } from 'react';
import { BookingTenantProvider } from '@/contexts/BookingTenantContext';
import { BookingProvider } from '@/contexts/BookingFlowContext';

export function BookingFlowProviders({
  businessId,
  children,
}: {
  businessId: string;
  children: ReactNode;
}) {
  return (
    <BookingTenantProvider businessId={businessId}>
      <BookingProvider businessId={businessId}>{children}</BookingProvider>
    </BookingTenantProvider>
  );
}
