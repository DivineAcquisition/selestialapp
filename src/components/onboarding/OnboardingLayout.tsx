"use client";

import { ReactNode } from 'react';
import Image from 'next/image';
import { useOnboarding } from './OnboardingContext';
import OnboardingProgress from './OnboardingProgress';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  onNext?: () => void | Promise<void>;
  loading?: boolean;
  hideProgress?: boolean;
}

export default function OnboardingLayout({
  children,
  title,
  subtitle,
  showBack = true,
  showNext = true,
  nextLabel = 'Continue',
  onNext,
  loading = false,
  hideProgress = false,
}: OnboardingLayoutProps) {
  const { currentStep, totalSteps, prevStep, nextStep, canGoNext } = useOnboarding();
  
  const handleNext = async () => {
    if (onNext) {
      await onNext();
    } else {
      nextStep();
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Image src="/logo-icon-new.png" alt="Selestial" width={40} height={40} className="h-10 w-auto" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          {!hideProgress && (
            <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
          )}
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {/* Content */}
          <div className="mb-8">
            {children}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            {showBack && currentStep > 0 ? (
              <Button variant="ghost" onClick={prevStep}>
                <Icon name="arrowLeft" size="md" className="mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {showNext && (
              <Button onClick={handleNext} disabled={!canGoNext || loading}>
                {loading ? (
                  <>
                    <Icon name="spinner" size="md" className="mr-2 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {nextLabel}
                    <Icon name="arrowRight" size="md" className="ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Selestial</span>
          <span>·</span>
          <a 
            href="https://selestial.io/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <span>·</span>
          <a 
            href="https://selestial.io/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
