"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBilling } from '@/hooks/useBilling';
import { useBusiness } from '@/contexts/BusinessContext';
import { useUsage } from '@/hooks/useUsage';
import UsageBar from '@/components/shared/UsageBar';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Clock,
  XCircle,
  Zap,
  Crown,
  MessageSquare,
  Users,
  BarChart3,
  Shield,
  Headphones,
  ArrowRight,
  CreditCard,
  ExternalLink,
  Infinity as InfinityIcon,
  Bot,
  Target,
  Receipt,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const plans = [
  {
    id: 'starter',
    name: 'Selestial Start',
    description: 'Perfect for small businesses getting started with quote follow-ups',
    price: 97,
    priceId: 'price_starter',
    popular: false,
    color: 'text-foreground',
    bgColor: 'bg-muted/30',
    features: [
      { text: '100 quotes per month', icon: Receipt, included: true },
      { text: '500 SMS per month', icon: MessageSquare, included: true },
      { text: '5 follow-up sequences', icon: Zap, included: true },
      { text: 'SMS & Email automation', icon: MessageSquare, included: true },
      { text: 'Business hours scheduling', icon: Clock, included: true },
      { text: 'Basic analytics', icon: BarChart3, included: true },
      { text: 'Email support', icon: Headphones, included: true },
      { text: 'AI smart replies', icon: Bot, included: false },
      { text: 'Payment links', icon: CreditCard, included: false },
      { text: 'Bulk campaigns', icon: Target, included: false },
    ],
  },
  {
    id: 'growth',
    name: 'Selestial Growth',
    description: 'For growing businesses that need unlimited power and AI features',
    price: 197,
    priceId: 'price_growth',
    popular: true,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    features: [
      { text: 'Unlimited quotes', icon: Receipt, included: true },
      { text: '2,000 SMS per month', icon: MessageSquare, included: true },
      { text: 'Unlimited sequences', icon: Zap, included: true },
      { text: 'AI-powered smart replies', icon: Bot, included: true },
      { text: 'Advanced analytics & reports', icon: BarChart3, included: true },
      { text: 'Payment link generation', icon: CreditCard, included: true },
      { text: 'Bulk campaigns', icon: Target, included: true },
      { text: 'Priority phone & email support', icon: Headphones, included: true },
      { text: 'Team collaboration (5 users)', icon: Users, included: true },
      { text: 'Custom integrations', icon: Shield, included: true },
    ],
  },
];

export default function BillingPage() {
  const { business } = useBusiness();
  const { usage } = useUsage();
  const {
    loading,
    isTrialing,
    isActive,
    isPastDue,
    willCancel,
    trialDaysRemaining,
    plan: currentPlan,
    currentPeriodEnd,
    createCheckout,
    openPortal,
    cancelSubscription,
    resumeSubscription,
  } = useBilling();

  const [showCancel, setShowCancel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setError(null);
    setSelectedPlan(planId);
    try {
      await createCheckout(planId as 'starter' | 'growth');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setSelectedPlan(null);
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

  const activePlan = currentPlan || 'starter';

  return (
    <Layout title="Billing">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
          <p className="text-muted-foreground text-lg">
            Simple, transparent pricing. Get started with a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Status Alerts */}
        <div className="max-w-3xl mx-auto space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isTrialing && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Trial Period - {trialDaysRemaining} days remaining
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Add a payment method to continue after your trial ends.
                </p>
              </div>
              <Button 
                onClick={() => handleSelectPlan(activePlan)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={loading}
              >
                Add Payment
              </Button>
            </div>
          )}

          {isPastDue && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Payment Past Due</p>
                <p className="text-sm text-destructive/80">
                  Please update your payment method to avoid service interruption.
                </p>
              </div>
              <Button onClick={openPortal} variant="destructive">
                Update Payment
              </Button>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = activePlan === plan.id && (isActive || isTrialing);
            const isUpgrade = activePlan === 'starter' && plan.id === 'growth' && isActive;
            
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 flex flex-col",
                  plan.popular && "border-primary shadow-lg shadow-primary/10",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-primary to-[#9D96FF] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5" />
                      RECOMMENDED
                    </div>
                  </div>
                )}

                <div className={cn("p-6 flex-1 flex flex-col", plan.bgColor)}>
                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={cn("text-xl font-bold", plan.color)}>{plan.name}</h3>
                      {isCurrentPlan && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-5xl font-bold", plan.color)}>${plan.price}</span>
                      <span className="text-muted-foreground text-lg">/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div 
                          key={feature.text} 
                          className={cn(
                            "flex items-center gap-3",
                            !feature.included && "opacity-50"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                            feature.included 
                              ? plan.popular 
                                ? "bg-primary/20 text-primary" 
                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {feature.included ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm",
                            !feature.included && "line-through"
                          )}>
                            {feature.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <Button 
                        variant="outline" 
                        className="w-full h-12" 
                        onClick={openPortal}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        Manage Subscription
                      </Button>
                    ) : isUpgrade ? (
                      <Button 
                        className="w-full h-12 gap-2 text-base"
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={loading || selectedPlan === plan.id}
                      >
                        {selectedPlan === plan.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            Upgrade to Growth
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant={plan.popular ? "default" : "outline"}
                        className="w-full h-12 gap-2 text-base"
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={loading || selectedPlan === plan.id}
                      >
                        {selectedPlan === plan.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Usage & Subscription Details */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Usage Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Current Usage</h3>
                <p className="text-sm text-muted-foreground">This billing period</p>
              </div>
            </div>

            <div className="space-y-5">
              <UsageBar feature="quotesPerMonth" label="Quotes" />
              <UsageBar feature="smsPerMonth" label="SMS Messages" />
              <UsageBar feature="activeSequences" label="Active Sequences" />
            </div>
          </Card>

          {/* Subscription Info */}
          {(isActive || isTrialing) && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Subscription</h3>
                  <p className="text-sm text-muted-foreground">Manage your billing</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <span className="font-semibold">
                    Selestial {activePlan === 'starter' ? 'Start' : 'Growth'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    {willCancel ? 'Access Until' : 'Next Billing'}
                  </span>
                  <span className="font-semibold">
                    {currentPeriodEnd ? formatDate(currentPeriodEnd) : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div>
                    {isTrialing ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Trial
                      </Badge>
                    ) : willCancel ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <XCircle className="h-3 w-3 mr-1" />
                        Canceling
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {business?.stripe_customer_id && (
                    <Button variant="outline" onClick={openPortal} disabled={loading} className="flex-1">
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Billing Portal
                    </Button>
                  )}

                  {willCancel ? (
                    <Button variant="outline" onClick={handleResume} disabled={loading} className="flex-1">
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Resume
                    </Button>
                  ) : !isTrialing && (
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setShowCancel(true)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* FAQ or Support */}
        <div className="text-center text-muted-foreground">
          <p>
            Questions about billing?{' '}
            <a href="mailto:support@selestial.io" className="text-primary hover:underline font-medium">
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel? You'll keep access until{' '}
              {currentPeriodEnd ? formatDate(currentPeriodEnd) : 'the end of your billing period'},
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
    </Layout>
  );
}
