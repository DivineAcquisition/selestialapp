"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useBusiness } from '@/providers';
import { OnboardingProvider, useOnboarding } from '@/components/onboarding/OnboardingContext';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepBusinessInfo from '@/components/onboarding/StepBusinessInfo';
import StepSequenceSetup from '@/components/onboarding/StepSequenceSetup';
import StepPhoneSetup from '@/components/onboarding/StepPhoneSetup';
import StepComplete from '@/components/onboarding/StepComplete';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

function OnboardingSteps() {
  const { currentStep } = useOnboarding();
  
  switch (currentStep) {
    case 0:
      return <StepWelcome />;
    case 1:
      return <StepBusinessInfo />;
    case 2:
      return <StepSequenceSetup />;
    case 3:
      return <StepPhoneSetup />;
    case 4:
      return <StepComplete />;
    default:
      return <StepWelcome />;
  }
}

function OnboardingContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Redirect if already has business
  useEffect(() => {
    if (!businessLoading && business) {
      router.push('/');
    }
  }, [business, businessLoading, router]);
  
  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-subtle" />
            <div className="relative w-16 h-16 rounded-2xl bg-card border border-border/50 shadow-lg shadow-black/10 flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo-icon-new.png" 
                alt="Selestial" 
                width={48} 
                height={48} 
                className="rounded-xl animate-float"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Setting up your account...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return <OnboardingSteps />;
}

export default function OnboardingClient() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
