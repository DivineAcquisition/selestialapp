'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface BookingTenant {
  id: string;
  name: string;
  ownerName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  timezone: string | null;
  logoUrl: string | null;
  primaryColor: string;
  depositPercent: number;
}

interface BookingTenantContextValue {
  tenant: BookingTenant | null;
  loading: boolean;
  error: string | null;
}

const BookingTenantContext = createContext<BookingTenantContextValue>({
  tenant: null,
  loading: true,
  error: null,
});

export function BookingTenantProvider({
  businessId,
  children,
}: {
  businessId: string;
  children: ReactNode;
}) {
  const [tenant, setTenant] = useState<BookingTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/booking/${businessId}/tenant`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Tenant lookup failed (${res.status})`);
        const body = await res.json();
        if (!cancelled) setTenant(body.tenant);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load tenant');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  return (
    <BookingTenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </BookingTenantContext.Provider>
  );
}

export function useBookingTenant(): BookingTenantContextValue {
  return useContext(BookingTenantContext);
}
