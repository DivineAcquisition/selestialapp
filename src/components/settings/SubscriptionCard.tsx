import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, Check, Zap } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface SubscriptionCardProps {
  subscription: {
    status: 'trialing' | 'active' | 'past_due' | 'cancelled';
    plan: string;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
  };
  onManageBilling: () => void;
  onUpgrade: () => void;
}

const PLAN_FEATURES = {
  starter: [
    'Up to 50 active quotes',
    '3 follow-up sequences',
    'SMS automation',
    'Email support',
  ],
  growth: [
    'Unlimited active quotes',
    'Unlimited sequences',
    'SMS & Email automation',
    'Priority support',
    'Custom integrations',
    'Team members (coming soon)',
  ],
};

export default function SubscriptionCard({ subscription, onManageBilling, onUpgrade }: SubscriptionCardProps) {
  const isTrialing = subscription.status === 'trialing';
  const isPastDue = subscription.status === 'past_due';
  const isGrowth = subscription.plan === 'growth';
  
  const trialDaysLeft = subscription.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  return (
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
      
      {/* Current plan */}
      <div className="p-4 bg-muted/50 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground capitalize">
              {subscription.plan} Plan
            </span>
            {isTrialing && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Trial
              </Badge>
            )}
            {isPastDue && (
              <Badge variant="destructive">
                Past Due
              </Badge>
            )}
          </div>
          
          <span className="text-2xl font-bold text-foreground">
            ${subscription.plan === 'starter' ? '147' : '247'}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </span>
        </div>
        
        {isTrialing && (
          <p className="text-sm text-muted-foreground mb-3">
            {trialDaysLeft} days left in trial • Ends {formatDate(subscription.trialEndsAt!)}
          </p>
        )}
        
        {isPastDue && (
          <p className="text-sm text-red-600 mb-3">
            Your payment is past due. Please update your payment method.
          </p>
        )}
        
        {/* Features */}
        <div className="space-y-2">
          {PLAN_FEATURES[subscription.plan as keyof typeof PLAN_FEATURES]?.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onManageBilling} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Manage Billing
        </Button>
        
        {!isGrowth && (
          <Button onClick={onUpgrade} className="gap-2">
            <Zap className="h-4 w-4" />
            Upgrade to Growth
          </Button>
        )}
      </div>
    </Card>
  );
}
