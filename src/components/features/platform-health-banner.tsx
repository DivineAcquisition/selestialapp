"use client";

import { useFeatureAwareness } from '@/providers/FeatureAwarenessProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export function PlatformHealthBanner() {
  const { awareness, isLoading } = useFeatureAwareness();
  const [dismissed, setDismissed] = useState(false);
  
  if (isLoading || !awareness || dismissed) return null;
  
  if (awareness.overallHealth === 'healthy') return null;
  
  const isCritical = awareness.overallHealth === 'critical';
  
  return (
    <Alert variant={isCritical ? 'destructive' : 'default'} className="mb-4">
      {isCritical ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle className="flex items-center justify-between">
        {isCritical ? 'Action Required' : 'Attention Needed'}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {awareness.criticalIssues.map((issue, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
              {issue}
            </li>
          ))}
          {awareness.warnings.map((warning, i) => (
            <li key={`w-${i}`} className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
              {warning}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
