"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { Icon } from '@/components/ui/icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PaymentSettings() {
  const { toast } = useToast();
  const { business, updateBusiness } = useBusiness();
  const {
    status,
    loading,
    refetch,
    startOnboarding,
    resumeOnboarding,
    openDashboard,
    disconnect,
  } = useStripeConnect();

  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { error } = await startOnboarding();
      if (error) throw error;
    } catch (err) {
      toast({
        title: 'Connection failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  const handleResume = async () => {
    setConnecting(true);
    try {
      const { error } = await resumeOnboarding();
      if (error) throw error;
    } catch (err) {
      toast({
        title: 'Failed to resume',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const { error } = await disconnect();
      if (error) throw error;
      toast({ title: 'Stripe disconnected' });
    } catch (err) {
      toast({
        title: 'Disconnect failed',
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggleAutoPaymentLink = async (enabled: boolean) => {
    await updateBusiness({ auto_send_payment_link: enabled });
    toast({ title: enabled ? 'Auto payment links enabled' : 'Auto payment links disabled' });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Icon name="spinner" size="xl" className="animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="overflow-hidden feature-card">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-sm">
                <Icon name="creditCard" size="xl" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Payment Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Accept payments directly from your quotes
                </p>
              </div>
            </div>
            {status.connected && status.chargesEnabled && (
              <Badge variant="default" className="gap-1.5 px-3 py-1">
                <Icon name="check" size="xs" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6">
          {!status.connected ? (
            /* Not Connected State */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                <Icon name="building" size="3xl" className="text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Connect Your Stripe Account</h4>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Accept online payments from your customers. Funds go directly to your bank account with industry-leading security.
              </p>
              <Button onClick={handleConnect} disabled={connecting} className="gap-2 glow-sm">
                {connecting ? (
                  <Icon name="spinner" size="md" className="animate-spin" />
                ) : (
                  <Icon name="arrowRight" size="md" />
                )}
                Connect with Stripe
              </Button>
              <p className="text-xs text-muted-foreground mt-6">
                Powered by Stripe. No monthly fees, only pay when you get paid.
              </p>
            </div>
          ) : !status.chargesEnabled ? (
            /* Onboarding Incomplete */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Icon name="alertCircle" size="3xl" className="text-amber-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Complete Your Setup</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Your Stripe account needs additional information before you can accept payments.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleResume} disabled={connecting} className="gap-2">
                  {connecting ? (
                    <Icon name="spinner" size="md" className="animate-spin" />
                  ) : (
                    <Icon name="arrowRight" size="md" />
                  )}
                  Continue Setup
                </Button>
                <Button variant="outline" onClick={() => refetch()} className="gap-2">
                  <Icon name="refresh" size="md" />
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            /* Fully Connected */
            <div className="space-y-6">
              {/* Connected Successfully Message */}
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Icon name="check" size="2xl" className="text-emerald-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Payments Enabled</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your Stripe account is connected. You can now accept payments directly from your quotes.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => openDashboard()} className="gap-2">
                  <Icon name="externalLink" size="md" />
                  Stripe Dashboard
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-destructive hover:text-destructive">
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Stripe?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will not be able to accept payments until you reconnect. Existing payments
                        and payouts will not be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {disconnecting ? (
                          <Icon name="spinner" size="md" className="animate-spin" />
                        ) : (
                          'Disconnect'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Settings */}
      {status.connected && status.chargesEnabled && (
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <Icon name="dollar" size="xl" className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Payment Options</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure how payments are handled
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-send payment links</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically include a payment link when sending quotes
                </p>
              </div>
              <Switch
                checked={business?.auto_send_payment_link ?? true}
                onCheckedChange={handleToggleAutoPaymentLink}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
