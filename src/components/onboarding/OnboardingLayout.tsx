import { ReactNode } from 'react';
import { useOnboarding } from './OnboardingContext';
import OnboardingProgress from './OnboardingProgress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

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
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-foreground">Selestial</span>
          </div>
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
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {showNext && (
              <Button onClick={handleNext} disabled={!canGoNext || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {nextLabel}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
