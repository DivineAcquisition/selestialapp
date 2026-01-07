import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  'Welcome',
  'Business',
  'Sequence',
  'Phone',
  'Complete',
];

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  // Don't show progress on welcome and complete steps
  if (currentStep === 0 || currentStep === totalSteps - 1) {
    return null;
  }
  
  const progressSteps = stepLabels.slice(1, -1); // Exclude welcome and complete
  const adjustedCurrent = currentStep - 1; // Adjust for removed welcome step
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {progressSteps.map((label, index) => {
          const isCompleted = index < adjustedCurrent;
          const isCurrent = index === adjustedCurrent;
          
          return (
            <div key={label} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Icon name="check" size="lg" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </div>
              
              {/* Connector line */}
              {index < progressSteps.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-0.5 mx-2 -mt-6',
                    index < adjustedCurrent ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
