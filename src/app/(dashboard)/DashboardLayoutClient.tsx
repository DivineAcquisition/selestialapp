"use client";

import { useEffect, useRef } from 'react';
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
  const { business, loading: businessLoading, initialized: businessInitialized } = useBusiness();
  const hasRedirected = useRef(false);

  // Compute readiness from current state (no setState needed)
  const isFullyInitialized = authInitialized && businessInitialized;
  const isLoading = authLoading || businessLoading;
  const isReady = isFullyInitialized && !isLoading && !!user && !!business;

  useEffect(() => {
    // Wait for both auth and business to be fully initialized
    if (!isFullyInitialized || isLoading) {
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
  }, [user, business, isLoading, isFullyInitialized, router, pathname]);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // Show loading while auth or business is initializing
  if (!isFullyInitialized) {
    return <PageLoading message="Loading..." />;
  }

  // Show loading while auth or business is still loading
  if (isLoading) {
    return <PageLoading message="Loading your workspace..." />;
  }

  // If user exists and business exists, show content
  if (isReady) {
    return (
      <>
        {children}
        <GlobalShortcuts />
        <AIFloatingButton />
      </>
    );
  }

  // Still waiting for redirect or something else
  return <PageLoading message="Loading..." />;
}
