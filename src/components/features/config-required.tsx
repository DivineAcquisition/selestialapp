"use client";

import { useConfig } from '@/providers/FeatureAwarenessProvider';
import type { ConfigCategory } from '@/lib/features/feature-registry';
import { CONFIG_REGISTRY } from '@/lib/features/feature-registry';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Settings } from 'lucide-react';
import Link from 'next/link';

interface ConfigRequiredProps {
  config: ConfigCategory;
  children: React.ReactNode;
  showProgress?: boolean;
  showAlert?: boolean;
}

export function ConfigRequired({ 
  config, 
  children,
  showProgress = true,
  showAlert = true
}: ConfigRequiredProps) {
  const { isComplete, status } = useConfig(config);
  const definition = CONFIG_REGISTRY[config];
  
  if (isComplete) {
    return <>{children}</>;
  }
  
  if (!showAlert) {
    return null;
  }
  
  return (
    <Alert>
      <Settings className="h-4 w-4" />
      <AlertTitle>Complete {definition?.name || config}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{definition?.description} needs to be configured.</p>
        
        {showProgress && status && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>
        )}
        
        {status?.missingItems && status.missingItems.length > 0 && (
          <ul className="text-xs list-disc list-inside">
            {status.missingItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        
        <Button size="sm" asChild>
          <Link href={definition?.settingsUrl || '/settings'}>Configure</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
