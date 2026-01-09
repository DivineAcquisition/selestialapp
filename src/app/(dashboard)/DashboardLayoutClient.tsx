"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useBusiness } from '@/providers';
import PageLoading from '@/components/PageLoading';
import GlobalShortcuts from '@/components/shared/GlobalShortcuts';
import AIFloatingButton from '@/components/shared/AIFloatingButton';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, initialized: authInitialized } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const [isReady, setIsReady] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Wait for auth to be fully initialized first
    if (!authInitialized) {
      return;
    }

    // Wait for both auth and business to finish loading
    if (authLoading || businessLoading) {
      return;
    }

    // If not logged in, redirect to login
    if (!user) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/login');
      }
      return;
    }

    // If no business exists, redirect to onboarding
    // But don't redirect if we're already there
    if (!business) {
      if (!pathname?.startsWith('/onboarding') && !hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/onboarding');
      }
      return;
    }

    // Everything is ready - user has account and business
    setIsReady(true);
  }, [user, business, authLoading, businessLoading, authInitialized, router, pathname]);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // Show loading while auth is initializing or loading
  if (!authInitialized || authLoading) {
    return <PageLoading message="Loading..." />;
  }

  // Show loading while business is loading (only if user exists)
  if (user && businessLoading) {
    return <PageLoading message="Loading your workspace..." />;
  }

  // If user exists and business exists, show content even if isReady hasn't updated yet
  if (user && business) {
    return (
      <>
        {children}
        <GlobalShortcuts />
        <AIFloatingButton />
      </>
    );
  }

  // Still waiting for redirect or something else
  if (!isReady) {
    return <PageLoading message="Loading..." />;
  }

  return (
    <>
      {children}
      <GlobalShortcuts />
      <AIFloatingButton />
    </>
  );
}
