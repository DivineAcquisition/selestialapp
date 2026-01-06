"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useBusiness } from '@/providers';
import PageLoading from '@/components/PageLoading';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for both auth and business to finish loading
    if (authLoading || businessLoading) {
      return;
    }

    // If not logged in, redirect to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // If no business exists and we're not already on onboarding, redirect there
    // But first make sure business loading is truly complete
    if (!business && !businessLoading) {
      // Don't redirect if we're already on onboarding
      if (!pathname?.startsWith('/onboarding')) {
        router.replace('/onboarding');
        return;
      }
    }

    // Everything is ready
    setIsReady(true);
  }, [user, business, authLoading, businessLoading, router, pathname]);

  // Show loading while checking auth/business status
  if (authLoading || businessLoading) {
    return <PageLoading message="Loading..." />;
  }

  // If user is not ready yet (redirecting), show loading
  if (!isReady) {
    // Don't show loading if we have user and business
    if (user && business) {
      return <>{children}</>;
    }
    return <PageLoading message="Loading..." />;
  }

  return <>{children}</>;
}
