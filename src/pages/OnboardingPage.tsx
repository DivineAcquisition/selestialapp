import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { OnboardingProvider, useOnboarding } from '@/components/onboarding/OnboardingContext';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepBusinessInfo from '@/components/onboarding/StepBusinessInfo';
import StepSequenceSetup from '@/components/onboarding/StepSequenceSetup';
import StepPhoneSetup from '@/components/onboarding/StepPhoneSetup';
import StepComplete from '@/components/onboarding/StepComplete';
import { Loader2 } from 'lucide-react';

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
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  // Redirect if already has business
  useEffect(() => {
    if (!businessLoading && business) {
      navigate('/');
    }
  }, [business, businessLoading, navigate]);
  
  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return <OnboardingSteps />;
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
