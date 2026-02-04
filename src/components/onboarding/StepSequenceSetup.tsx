import { useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import OnboardingLayout from './OnboardingLayout';
import { Card } from '@/components/ui/card';
import { DEFAULT_SEQUENCE_STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export default function StepSequenceSetup() {
  const { data, updateData, setCanGoNext } = useOnboarding();
  
  // Always valid - default sequence is fine
  useEffect(() => {
    setCanGoNext(true);
  }, [setCanGoNext]);
  
  // Replace merge fields for preview
  const previewMessage = (message: string) => {
    return message
      .replace('{{customer_first_name}}', 'Sarah')
      .replace('{{customer_name}}', 'Sarah Williams')
      .replace('{{owner_name}}', data.ownerName || 'Mike')
      .replace('{{business_name}}', data.businessName || 'Your Business')
      .replace('{{quote_amount}}', '$2,500')
      .replace('{{service_type}}', 'Water Heater Install');
  };
  
  return (
    <OnboardingLayout
      title="Set up your follow-up sequence"
      subtitle="Choose how you want to follow up with customers"
    >
      <div className="space-y-6">
        {/* Sequence option cards */}
        <div className="grid gap-4">
          {/* Default sequence */}
          <Card
            className={cn(
              'p-4 cursor-pointer transition-all border-2',
              data.useDefaultSequence
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => updateData({ useDefaultSequence: true })}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  data.useDefaultSequence
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}
              >
                {data.useDefaultSequence && <Icon name="check" size="xs" className="text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Standard Follow-Up</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                    <Icon name="star" size="xs" />
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  5 messages over 14 days. Proven to convert.
                </p>
              </div>
            </div>
          </Card>
          
          {/* Create own (future) */}
          <Card
            className={cn(
              'p-4 cursor-pointer transition-all border-2',
              !data.useDefaultSequence
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => updateData({ useDefaultSequence: false })}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  !data.useDefaultSequence
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}
              >
                {!data.useDefaultSequence && <Icon name="check" size="xs" className="text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Start from Scratch</h3>
                <p className="text-sm text-muted-foreground">
                  Create your own sequence after setup.
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Sequence preview */}
        {data.useDefaultSequence && (
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Sequence Preview</h3>
            
            <div className="space-y-4">
              {DEFAULT_SEQUENCE_STEPS.map((step, index) => (
                <div key={index} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="message" size="md" className="text-primary" />
                    </div>
                    {index < DEFAULT_SEQUENCE_STEPS.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        Step {index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="clock" size="xs" />
                        {step.delay_days === 0 
                          ? 'Immediate' 
                          : `Day ${step.delay_days}`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-background rounded-lg p-3 border border-border">
                      {previewMessage(step.message)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              You can customize these messages anytime in Settings → Sequences
            </p>
          </div>
        )}
        
        {!data.useDefaultSequence && (
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              You will be able to create your custom sequence after completing setup.
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
