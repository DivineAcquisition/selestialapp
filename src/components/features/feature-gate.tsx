"use client";

import { useFeature } from '@/providers/FeatureAwarenessProvider';
import type { FeatureKey } from '@/lib/features/feature-registry';
import { FEATURE_REGISTRY } from '@/lib/features/feature-registry';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  
  // What to show when feature isn't available
  fallback?: React.ReactNode;
  
  // Show a card explaining why feature isn't available
  showBlockedUI?: boolean;
  
  // Just hide content without showing anything
  hideWhenBlocked?: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showBlockedUI = true,
  hideWhenBlocked = false
}: FeatureGateProps) {
  const { canUse, status, isEnabled, isAvailable } = useFeature(feature);
  const definition = FEATURE_REGISTRY[feature];
  
  // Feature is available and working
  if (canUse) {
    return <>{children}</>;
  }
  
  // Hide completely
  if (hideWhenBlocked) {
    return null;
  }
  
  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default blocked UI
  if (!showBlockedUI) {
    return null;
  }
  
  // Not available on plan
  if (!isAvailable) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{definition?.name || feature}</CardTitle>
          </div>
          <CardDescription>{definition?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Upgrade Required</AlertTitle>
            <AlertDescription>
              This feature is available on {definition?.availableOnPlans.join(', ')} plans.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" asChild>
            <Link href="/billing">Upgrade Plan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Not enabled
  if (!isEnabled) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{definition?.name || feature}</CardTitle>
          </div>
          <CardDescription>{definition?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This feature is not enabled yet.
          </p>
          <Button asChild>
            <Link href={definition?.setupUrl || '/settings'}>Enable Feature</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Missing dependencies
  if (status?.missingDependencies && status.missingDependencies.length > 0) {
    const requiredMissing = status.missingDependencies.filter(d => d.isRequired);
    
    return (
      <Card className="border-dashed border-amber-500/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">{definition?.name || feature}</CardTitle>
          </div>
          <CardDescription>Setup required to use this feature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm font-medium">Complete these steps:</p>
            <ul className="space-y-2">
              {requiredMissing.map((dep, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-sm">{dep.label}</span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={dep.setupUrl}>
                      Setup <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return <>{children}</>;
}
