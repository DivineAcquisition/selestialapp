"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBilling } from '@/hooks/useBilling';
import { useBusiness } from '@/contexts/BusinessContext';
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
  Infinity,
  ArrowRight,
  CreditCard,
  ExternalLink,
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
    features: [
      { text: '100 quotes per month', icon: MessageSquare },
      { text: '5 follow-up sequences', icon: Zap },
      { text: 'SMS & Email automation', icon: MessageSquare },
      { text: 'Business hours scheduling', icon: Clock },
      { text: 'Basic analytics', icon: BarChart3 },
      { text: 'Email support', icon: Headphones },
    ],
  },
  {
    id: 'growth',
    name: 'Selestial Growth',
    description: 'For growing businesses that need unlimited power',
    price: 197,
    priceId: 'price_growth',
    popular: true,
    features: [
      { text: 'Unlimited quotes', icon: Infinity },
      { text: 'Unlimited sequences', icon: Infinity },
      { text: 'AI-powered smart replies', icon: Sparkles },
      { text: 'Advanced analytics & reports', icon: BarChart3 },
      { text: 'Payment link generation', icon: CreditCard },
      { text: 'Priority phone & email support', icon: Headphones },
      { text: 'Custom integrations', icon: Shield },
      { text: 'Team collaboration', icon: Users },
    ],
  },
];

export default function BillingPage() {
  const { business } = useBusiness();
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Simple, transparent pricing. Get started with a 14-day free trial, no credit card required.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isTrialing && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 max-w-2xl mx-auto">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Trial Period - {trialDaysRemaining} days remaining
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Add a payment method to continue after your trial ends.
              </p>
            </div>
          </div>
        )}

        {isPastDue && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Payment Past Due</p>
              <p className="text-sm text-destructive/80">
                Please update your payment method to avoid service interruption.
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {plans.map((plan) => {
            const isCurrentPlan = activePlan === plan.id && isActive;
            const isUpgrade = activePlan === 'starter' && plan.id === 'growth' && isActive;
            
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  plan.popular && "border-primary shadow-lg",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      {isCurrentPlan && (
                        <Badge variant="default" className="text-xs">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                            plan.popular ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="text-sm">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
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
                      className="w-full gap-2"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading || selectedPlan === plan.id}
                    >
                      {selectedPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Upgrade to Growth
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full gap-2"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading || selectedPlan === plan.id}
                    >
                      {selectedPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Current Subscription Info */}
        {isActive && (
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Subscription Details</h3>
                <p className="text-sm text-muted-foreground">Manage your billing information</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-semibold capitalize">
                  Selestial {activePlan === 'starter' ? 'Start' : 'Growth'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {willCancel ? 'Access Until' : 'Next Billing Date'}
                </p>
                <p className="font-semibold">
                  {currentPeriodEnd ? formatDate(currentPeriodEnd) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  {willCancel ? (
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
            </div>

            <div className="flex flex-wrap gap-3">
              {business?.stripe_customer_id && (
                <Button variant="outline" onClick={openPortal} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Billing Portal
                </Button>
              )}

              {willCancel ? (
                <Button variant="outline" onClick={handleResume} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Resume Subscription
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setShowCancel(true)}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* FAQ or Support */}
        <div className="text-center mt-10 text-muted-foreground">
          <p>
            Questions about billing?{' '}
            <a href="mailto:support@selestial.io" className="text-primary hover:underline">
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
