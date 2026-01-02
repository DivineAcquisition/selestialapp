import { createContext, useContext, useState, ReactNode } from 'react';

type IndustryType = 'hvac' | 'plumbing' | 'electrical' | 'roofing' | 'cleaning' | 'landscaping' | 'general_contractor' | 'other';

interface OnboardingData {
  // Step 1: Business Info
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  industry: IndustryType;
  
  // Step 2: Sequence
  useDefaultSequence: boolean;
  customSequenceName: string;
  
  // Step 3: Phone (optional)
  skipPhoneSetup: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
}

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  setCurrentStep: (step: number) => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  setCanGoNext: (can: boolean) => void;
}

const defaultData: OnboardingData = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  industry: 'other',
  useDefaultSequence: true,
  customSequenceName: '',
  skipPhoneSetup: true,
  twilioAccountSid: '',
  twilioAuthToken: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [canGoNext, setCanGoNext] = useState(false);
  
  const totalSteps = 5; // Welcome, Business, Sequence, Phone, Complete
  
  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };
  
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setCanGoNext(false);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <OnboardingContext.Provider value={{
      currentStep,
      totalSteps,
      data,
      setCurrentStep,
      updateData,
      nextStep,
      prevStep,
      canGoNext,
      setCanGoNext,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
