"use client";

import { useIntegration } from '@/providers/FeatureAwarenessProvider';
import type { IntegrationKey } from '@/lib/features/feature-registry';
import { INTEGRATION_REGISTRY } from '@/lib/features/feature-registry';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plug, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface IntegrationRequiredProps {
  integration: IntegrationKey;
  children: React.ReactNode;
  message?: string;
  showAlert?: boolean;
}

export function IntegrationRequired({ 
  integration, 
  children, 
  message,
  showAlert = true
}: IntegrationRequiredProps) {
  const { isConnected, status } = useIntegration(integration);
  const definition = INTEGRATION_REGISTRY[integration];
  
  if (isConnected && status?.healthStatus !== 'failing') {
    return <>{children}</>;
  }
  
  if (!showAlert) {
    return null;
  }
  
  // Integration failing
  if (isConnected && status?.healthStatus === 'failing') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{definition?.name || integration} Connection Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{status.lastError || 'Connection is experiencing issues.'}</span>
          <Button size="sm" variant="outline" className="ml-2" asChild>
            <Link href={definition?.connectUrl || '/connections'}>Reconnect</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Not connected
  return (
    <Alert>
      <Plug className="h-4 w-4" />
      <AlertTitle>Connect {definition?.name || integration}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message || definition?.description}</span>
        <Button size="sm" className="ml-2" asChild>
          <Link href={definition?.connectUrl || '/connections'}>Connect Now</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
