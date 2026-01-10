"use client";

import { useFeatureAwareness } from '@/providers/FeatureAwarenessProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ONBOARDING_STEPS = [
  { key: 'business_profile', label: 'Complete Business Profile', url: '/settings' },
  { key: 'first_service', label: 'Add Your First Service', url: '/services' },
  { key: 'pricing', label: 'Configure Pricing', url: '/pricing' },
  { key: 'availability', label: 'Set Availability Hours', url: '/settings' },
  { key: 'booking_widget', label: 'Customize Booking Widget', url: '/widget' },
  { key: 'first_booking', label: 'Get Your First Booking', url: '/bookings' }
];

interface SetupChecklistProps {
  compact?: boolean;
}

export function SetupChecklist({ compact = false }: SetupChecklistProps) {
  const { awareness, isLoading } = useFeatureAwareness();
  
  if (isLoading || !awareness) return null;
  if (awareness.onboarding.isComplete) return null;
  
  const { onboarding } = awareness;
  
  if (compact) {
    return (
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Setup Progress</span>
          <span className="text-sm text-muted-foreground">{onboarding.overallProgress}%</span>
        </div>
        <Progress value={onboarding.overallProgress} className="h-2" />
        <div className="mt-2">
          {onboarding.remainingSteps.length > 0 && (
            <Button size="sm" variant="link" className="h-auto p-0 text-xs" asChild>
              <Link href={ONBOARDING_STEPS.find(s => s.key === onboarding.currentStep)?.url || '/settings'}>
                Continue setup <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Getting Started</CardTitle>
        <CardDescription>
          Complete these steps to get the most out of Selestial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Setup Progress</span>
            <span className="font-medium">{onboarding.overallProgress}%</span>
          </div>
          <Progress value={onboarding.overallProgress} />
        </div>
        
        <div className="space-y-2">
          {ONBOARDING_STEPS.map((step) => {
            const isCompleted = onboarding.completedSteps.includes(step.key);
            const isCurrent = onboarding.currentStep === step.key;
            
            return (
              <div 
                key={step.key}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  isCurrent ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={`text-sm ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                    {step.label}
                  </span>
                </div>
                
                {!isCompleted && (
                  <Button size="sm" variant={isCurrent ? 'default' : 'ghost'} asChild>
                    <Link href={step.url}>
                      {isCurrent ? 'Start' : 'Go'}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
