import { useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import OnboardingLayout from './OnboardingLayout';
import { MessageSquare, TrendingUp, Clock, Zap } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Automated Follow-Ups',
    description: 'SMS sequences that follow up on every quote automatically',
  },
  {
    icon: TrendingUp,
    title: 'Win More Jobs',
    description: 'Convert 20-40% more quotes with consistent follow-up',
  },
  {
    icon: Clock,
    title: 'Save 10+ Hours Weekly',
    description: 'No more manual texting or remembering to follow up',
  },
  {
    icon: Zap,
    title: 'Get Started in 5 Minutes',
    description: 'Simple setup, immediate results',
  },
];

export default function StepWelcome() {
  const { setCanGoNext } = useOnboarding();
  
  // Always allow proceeding from welcome
  useEffect(() => {
    setCanGoNext(true);
  }, [setCanGoNext]);
  
  return (
    <OnboardingLayout
      title="Welcome to Selestial"
      subtitle="Let's set up your automated follow-up system"
      showBack={false}
      nextLabel="Let's Get Started"
      hideProgress
    >
      <div className="space-y-8">
        {/* Value props */}
        <div className="grid gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* What we'll do */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Here's what we'll set up:</h3>
          <div className="space-y-3">
            {[
              'Your business profile',
              'Your first follow-up sequence',
              'SMS sending (optional)',
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </div>
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Takes about 5 minutes
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
