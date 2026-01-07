"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon, IconName } from '@/components/ui/icon';
import { useBilling } from '@/hooks/useBilling';
import { useBusiness } from '@/contexts/BusinessContext';
import { useUsage } from '@/hooks/useUsage';
import UsageBar from '@/components/shared/UsageBar';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PlanFeature {
  text: string;
  icon: IconName;
  included: boolean;
}

const plans: {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  popular: boolean;
  color: string;
  bgColor: string;
  features: PlanFeature[];
}[] = [
  {
    id: 'starter',
    name: 'Selestial Start',
    description: 'Perfect for small businesses getting started with quote follow-ups',
    price: 97,
    priceId: 'price_starter',
    popular: false,
    color: 'text-gray-900',
    bgColor: 'bg-gray-50/50',
    features: [
      { text: '100 quotes per month', icon: 'receipt', included: true },
      { text: '500 SMS per month', icon: 'message', included: true },
      { text: '5 follow-up sequences', icon: 'bolt', included: true },
      { text: 'SMS & Email automation', icon: 'message', included: true },
      { text: 'Business hours scheduling', icon: 'clock', included: true },
      { text: 'Basic analytics', icon: 'chart', included: true },
      { text: 'Email support', icon: 'headphones', included: true },
      { text: 'AI smart replies', icon: 'robot', included: false },
      { text: 'Payment links', icon: 'creditCard', included: false },
      { text: 'Bulk campaigns', icon: 'target', included: false },
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
      { text: 'Unlimited quotes', icon: 'receipt', included: true },
      { text: '2,000 SMS per month', icon: 'message', included: true },
      { text: 'Unlimited sequences', icon: 'bolt', included: true },
      { text: 'AI-powered smart replies', icon: 'robot', included: true },
      { text: 'Advanced analytics & reports', icon: 'chart', included: true },
      { text: 'Payment link generation', icon: 'creditCard', included: true },
      { text: 'Bulk campaigns', icon: 'target', included: true },
      { text: 'Priority phone & email support', icon: 'headphones', included: true },
      { text: 'Team collaboration (5 users)', icon: 'users', included: true },
      { text: 'Custom integrations', icon: 'shield', included: true },
    ],
  },
];

export default function BillingPage() {
  const { business } = useBusiness();
  useUsage();
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Icon name="sparkles" size="sm" />
            Simple Pricing
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h2>
          <p className="text-gray-500 text-lg">
            Simple, transparent pricing. Get started with a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Status Alerts */}
        <div className="max-w-3xl mx-auto space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
              <Icon name="alertCircle" size="lg" className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {isTrialing && (
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Icon name="clock" size="xl" className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  Trial Period - {trialDaysRemaining} days remaining
                </p>
                <p className="text-sm text-amber-700">
                  Add a payment method to continue after your trial ends.
                </p>
              </div>
              <Button 
                onClick={() => handleSelectPlan(activePlan)}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                disabled={loading}
              >
                Add Payment
              </Button>
            </div>
          )}

          {isPastDue && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Icon name="alertCircle" size="xl" className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">Payment Past Due</p>
                <p className="text-sm text-red-700">
                  Please update your payment method to avoid service interruption.
                </p>
              </div>
              <Button onClick={openPortal} className="bg-red-600 hover:bg-red-700 rounded-xl">
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
                  "relative overflow-hidden transition-all duration-300 flex flex-col rounded-2xl",
                  plan.popular && "border-2 border-primary shadow-xl shadow-primary/10",
                  isCurrentPlan && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-primary to-[#9D96FF] text-white text-xs font-bold px-4 py-2 rounded-bl-2xl flex items-center gap-1.5">
                      <Icon name="crown" size="xs" />
                      RECOMMENDED
                    </div>
                  </div>
                )}

                <div className={cn("p-8 flex-1 flex flex-col", plan.bgColor)}>
                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={cn("text-xl font-bold", plan.color)}>{plan.name}</h3>
                      {isCurrentPlan && (
                        <Badge className="bg-primary text-white border-0 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-5xl font-bold", plan.color)}>
                        $<AnimatedCounter value={plan.price} />
                      </span>
                      <span className="text-gray-500 text-lg">/month</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => {
                      return (
                        <div 
                          key={feature.text} 
                          className={cn(
                            "flex items-center gap-3",
                            !feature.included && "opacity-50"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                            feature.included 
                              ? plan.popular 
                                ? "bg-primary/20 text-primary" 
                                : "bg-emerald-100 text-emerald-600" 
                              : "bg-gray-100 text-gray-400"
                          )}>
                            {feature.included ? (
                              <Icon name="check" size="sm" />
                            ) : (
                              <Icon name="xCircle" size="sm" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm text-gray-700",
                            !feature.included && "line-through text-gray-400"
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
                        className="w-full h-12 rounded-xl" 
                        onClick={openPortal}
                        disabled={loading}
                      >
                        {loading ? (
                          <Icon name="spinner" size="sm" className="animate-spin mr-2" />
                        ) : (
                          <Icon name="externalLink" size="sm" className="mr-2" />
                        )}
                        Manage Subscription
                      </Button>
                    ) : isUpgrade ? (
                      <Button 
                        className="w-full h-12 gap-2 text-base bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl"
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={loading || selectedPlan === plan.id}
                      >
                        {selectedPlan === plan.id ? (
                          <Icon name="spinner" size="lg" className="animate-spin" />
                        ) : (
                          <>
                            <Icon name="sparkles" size="lg" />
                            Upgrade to Growth
                            <Icon name="arrowRight" size="lg" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant={plan.popular ? "default" : "outline"}
                        className={cn(
                          "w-full h-12 gap-2 text-base rounded-xl",
                          plan.popular && "bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
                        )}
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={loading || selectedPlan === plan.id}
                      >
                        {selectedPlan === plan.id ? (
                          <Icon name="spinner" size="lg" className="animate-spin" />
                        ) : (
                          <>
                            Get Started
                            <Icon name="arrowRight" size="lg" />
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
          <Card className="card-elevated p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#9D96FF] flex items-center justify-center shadow-lg shadow-primary/20">
                <Icon name="chart" size="xl" className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Usage</h3>
                <p className="text-sm text-gray-500">This billing period</p>
              </div>
            </div>

            <div className="space-y-6">
              <UsageBar feature="quotesPerMonth" label="Quotes" />
              <UsageBar feature="smsPerMonth" label="SMS Messages" />
              <UsageBar feature="activeSequences" label="Active Sequences" />
            </div>
          </Card>

          {/* Subscription Info */}
          {(isActive || isTrialing) && (
            <Card className="card-elevated p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#9D96FF] flex items-center justify-center shadow-lg shadow-primary/20">
                  <Icon name="creditCard" size="xl" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Subscription</h3>
                  <p className="text-sm text-gray-500">Manage your billing</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Current Plan</span>
                  <span className="font-semibold text-gray-900">
                    Selestial {activePlan === 'starter' ? 'Start' : 'Growth'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">
                    {willCancel ? 'Access Until' : 'Next Billing'}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {currentPeriodEnd ? formatDate(currentPeriodEnd) : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Status</span>
                  <div>
                    {isTrialing ? (
                      <Badge className="bg-amber-100 text-amber-800 border-0">
                        <Icon name="clock" size="xs" className="mr-1" />
                        Trial
                      </Badge>
                    ) : willCancel ? (
                      <Badge className="bg-amber-100 text-amber-800 border-0">
                        <Icon name="xCircle" size="xs" className="mr-1" />
                        Canceling
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 border-0">
                        <Icon name="check" size="xs" className="mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {business?.stripe_customer_id && (
                    <Button variant="outline" onClick={openPortal} disabled={loading} className="flex-1 rounded-xl">
                      {loading && <Icon name="spinner" size="sm" className="mr-2 animate-spin" />}
                      <Icon name="externalLink" size="sm" className="mr-2" />
                      Billing Portal
                    </Button>
                  )}

                  {willCancel ? (
                    <Button variant="outline" onClick={handleResume} disabled={loading} className="flex-1 rounded-xl">
                      {loading && <Icon name="spinner" size="sm" className="mr-2 animate-spin" />}
                      Resume
                    </Button>
                  ) : !isTrialing && (
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-red-600"
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
        <div className="text-center text-gray-500">
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
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel? You&apos;ll keep access until{' '}
              {currentPeriodEnd ? formatDate(currentPeriodEnd) : 'the end of your billing period'},
              then your account will be downgraded. Your data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)} className="rounded-xl">
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading} className="rounded-xl">
              {loading && <Icon name="spinner" size="sm" className="mr-2 animate-spin" />}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
