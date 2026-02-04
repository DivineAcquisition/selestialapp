import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
  DollarSign,
  ArrowRight,
  Building2,
  RefreshCw,
} from 'lucide-react';
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
    balance,
    payouts,
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

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Payment Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Accept payments directly from your quotes
                </p>
              </div>
            </div>
            {status.connected && status.chargesEnabled && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6">
          {!status.connected ? (
            /* Not Connected State */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-2">Connect Your Stripe Account</h4>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Accept online payments from your customers. Funds go directly to your bank account with industry-leading security.
              </p>
              <Button onClick={handleConnect} disabled={connecting} className="gap-2">
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Connect with Stripe
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Powered by Stripe. No monthly fees, only pay when you get paid.
              </p>
            </div>
          ) : !status.chargesEnabled ? (
            /* Onboarding Incomplete */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
              <h4 className="font-medium mb-2">Complete Your Setup</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Your Stripe account needs additional information before you can accept payments.
              </p>
              {status.requirementsDue.length > 0 && (
                <div className="mb-4 p-3 bg-muted rounded-lg text-left max-w-md mx-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Required information:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {status.requirementsDue.slice(0, 3).map((req) => (
                      <li key={req} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-warning" />
                        {req.replace(/_/g, ' ').replace(/\./g, ' → ')}
                      </li>
                    ))}
                    {status.requirementsDue.length > 3 && (
                      <li className="text-muted-foreground">
                        +{status.requirementsDue.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Button onClick={handleResume} disabled={connecting} className="gap-2">
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Continue Setup
                </Button>
                <Button variant="outline" onClick={() => refetch()} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          ) : (
            /* Fully Connected */
            <div className="space-y-6">
              {/* Balance Overview */}
              {balance && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Available</p>
                    <p className="text-2xl font-semibold text-primary">
                      {balance.available[0]
                        ? formatCurrency(balance.available[0].amount, balance.available[0].currency)
                        : '$0.00'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-2xl font-semibold">
                      {balance.pending[0]
                        ? formatCurrency(balance.pending[0].amount, balance.pending[0].currency)
                        : '$0.00'}
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Payouts */}
              {payouts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Payouts</h4>
                  <div className="space-y-2">
                    {payouts.slice(0, 3).map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatCurrency(payout.amount, payout.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payout.arrival_date * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={payout.status === 'paid' ? 'default' : 'secondary'}
                        >
                          {payout.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => openDashboard()} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
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
                        You won't be able to accept payments until you reconnect. Existing payments
                        and payouts won't be affected.
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
                          <Loader2 className="h-4 w-4 animate-spin" />
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
          <h3 className="font-semibold mb-4">Payment Options</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-send payment links</p>
                <p className="text-sm text-muted-foreground">
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
