import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBilling } from '@/hooks/useBilling';
import { useBusiness } from '@/contexts/BusinessContext';
import { formatDate } from '@/lib/formatters';
import {
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Clock,
  XCircle
} from 'lucide-react';

const PLAN_FEATURES = {
  starter: [
    '50 quotes per month',
    '3 sequences',
    'SMS automation',
    'Business hours',
    'Email support',
  ],
  growth: [
    'Unlimited quotes',
    'Unlimited sequences',
    'SMS automation',
    'Business hours',
    'Priority support',
    'Custom integrations',
  ],
};

export default function SubscriptionCard() {
  const { business } = useBusiness();
  const {
    loading,
    isTrialing,
    isActive,
    isPastDue,
    willCancel,
    trialDaysRemaining,
    plan,
    currentPeriodEnd,
    createCheckout,
    openPortal,
    cancelSubscription,
    resumeSubscription,
    upgrade,
  } = useBilling();

  const [showCancel, setShowCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setError(null);
    try {
      await upgrade();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
    }
  };

  const handleCancel = async () => {
    setError(null);
    const { error } = await cancelSubscription();
    if (error) {
      setError(error.message);
    } else {
      setShowCancel(false);
    }
  };

  const handleResume = async () => {
    setError(null);
    const { error } = await resumeSubscription();
    if (error) {
      setError(error.message);
    }
  };

  const currentPlan = plan || 'starter';
  const features = PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter;
  const price = currentPlan === 'growth' ? 297 : 147;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Subscription</h3>
            <p className="text-sm text-muted-foreground">Manage your plan and billing</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Current plan card */}
        <div className="p-4 bg-muted/50 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-foreground capitalize">
                {currentPlan} Plan
              </span>
              {isTrialing && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {trialDaysRemaining} days left
                </Badge>
              )}
              {isPastDue && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Past due
                </Badge>
              )}
              {willCancel && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  <XCircle className="h-3 w-3 mr-1" />
                  Canceling
                </Badge>
              )}
            </div>

            <span className="text-2xl font-bold text-foreground">
              ${price}<span className="text-sm font-normal text-muted-foreground">/month</span>
            </span>
          </div>

          {currentPlan === 'starter' && (
            <Button onClick={handleUpgrade} disabled={loading} className="mb-4 gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Upgrade to Growth
            </Button>
          )}

          {/* Period info */}
          {currentPeriodEnd && !isTrialing && (
            <p className="text-sm text-muted-foreground mb-3">
              {willCancel
                ? `Access until ${formatDate(currentPeriodEnd)}`
                : `Renews on ${formatDate(currentPeriodEnd)}`
              }
            </p>
          )}

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {business?.stripe_customer_id && (
            <Button variant="outline" onClick={openPortal} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Manage Billing
            </Button>
          )}

          {isTrialing && (
            <Button onClick={() => createCheckout(currentPlan as 'starter' | 'growth')} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Payment Method
            </Button>
          )}

          {willCancel ? (
            <Button variant="outline" onClick={handleResume} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Resume Subscription
            </Button>
          ) : (isActive && !isTrialing) && (
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setShowCancel(true)}
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </Card>

      {/* Cancel confirmation */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel? You'll keep access until {currentPeriodEnd ? formatDate(currentPeriodEnd) : 'the end of your billing period'},
              then your account will be downgraded. Your data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
