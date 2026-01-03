"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useBusiness } from '@/providers';
import PageLoading from '@/components/PageLoading';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!authLoading && !businessLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (!business) {
        router.push('/onboarding');
        return;
      }
      
      setChecked(true);
    }
  }, [user, business, authLoading, businessLoading, router]);

  if (authLoading || businessLoading || !checked) {
    return <PageLoading message="Loading..." />;
  }

  return <>{children}</>;
}
