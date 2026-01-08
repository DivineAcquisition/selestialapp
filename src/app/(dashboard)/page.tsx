"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import QuotePipeline from '@/components/dashboard/QuotePipeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickAddQuote from '@/components/quotes/QuickAddQuote';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { Icon } from '@/components/ui/icon';
import { formatCurrency } from '@/lib/formatters';
import { useBusiness } from '@/providers';
import { useQuotes } from '@/hooks/useQuotes';
import { useActivities } from '@/hooks/useActivities';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Quote, ActivityLog, QuoteStatus } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { business } = useBusiness();
  const { quotes } = useQuotes();
  const { activities } = useActivities(10);
  const { stats } = useDashboardStats();
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Keyboard shortcut: press 'n' or 'q' to add new quote
  const shortcuts = useMemo(() => ({
    'n': () => setShowQuickAdd(true),
    'q': () => setShowQuickAdd(true),
  }), []);
  
  useKeyboardShortcuts(shortcuts);
  
  const handleQuoteClick = (quoteId: string) => {
    router.push(`/quotes?id=${quoteId}`);
  };

  // Transform DB quotes to the expected Quote type format for components
  const transformedQuotes: Quote[] = quotes.map(q => ({
    id: q.id,
    created_at: q.created_at,
    updated_at: q.updated_at,
    business_id: q.business_id,
    sequence_id: q.sequence_id ?? undefined,
    customer_name: q.customer_name,
    customer_phone: q.customer_phone,
    customer_email: q.customer_email ?? undefined,
    service_type: q.service_type,
    quote_amount: q.quote_amount,
    description: q.description ?? undefined,
    status: q.status as QuoteStatus,
    status_changed_at: q.status_changed_at,
    current_step_index: q.current_step_index,
    next_message_at: q.next_message_at ?? undefined,
    won_at: q.won_at ?? undefined,
    lost_at: q.lost_at ?? undefined,
    lost_reason: q.lost_reason ?? undefined,
    final_job_amount: q.final_job_amount ?? undefined,
  }));

  // Transform DB activities to the expected ActivityLog type format
  const transformedActivities: ActivityLog[] = activities.map(a => ({
    id: a.id,
    created_at: a.created_at,
    action: a.action,
    description: a.description,
    quote_id: a.quote_id ?? undefined,
  }));

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[#9D96FF] p-6 md:p-8 text-white">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9D96FF]/30 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="sparkles" size="lg" className="animate-pulse" />
                  <span className="text-sm font-medium text-white/80">{getGreeting()}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {business?.owner_name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-white/70 max-w-lg">
                  You have <span className="text-white font-semibold">{stats.activeQuotes} active quotes</span> awaiting follow-up. 
                  Your conversion rate is up <span className="text-emerald-300 font-semibold">5%</span> this month!
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  size="lg"
                  onClick={() => setShowQuickAdd(true)}
                  className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl"
                >
                  <Icon name="plus" size="lg" className="mr-2" />
                  New Quote
                </Button>
                <Button 
                  size="lg"
                  variant="ghost"
                  onClick={() => router.push('/inbox')}
                  className="text-white border border-white/20 hover:bg-white/10 rounded-xl"
                >
                  <Icon name="message" size="lg" className="mr-2" />
                  Inbox
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Quotes */}
          <div 
            onClick={() => router.push('/quotes?status=active')}
            className="group card-elevated p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon name="fileText" size="lg" />
              </div>
              <Icon name="arrowRight" size="sm" className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.activeQuotes} />
            </div>
            <p className="text-sm text-gray-500">Active Quotes</p>
          </div>
          
          {/* Conversion Rate */}
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Icon name="trendUp" size="lg" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                +5%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.conversionRate} suffix="%" />
            </div>
            <p className="text-sm text-gray-500">Conversion Rate</p>
          </div>
          
          {/* Won This Month */}
          <div 
            onClick={() => router.push('/quotes?status=won')}
            className="group card-elevated p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Icon name="target" size="lg" />
              </div>
              <Icon name="arrowRight" size="sm" className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.wonCount} />
            </div>
            <p className="text-sm text-gray-500">Won This Month</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {formatCurrency(stats.wonAmount)}
            </p>
          </div>
          
          {/* Revenue Recovered */}
          <div className="group card-elevated p-5 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Icon name="dollar" size="lg" />
              </div>
              <Icon name="sparkles" size="sm" className="text-primary animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(stats.revenueRecovered)}
            </div>
            <p className="text-sm text-gray-500">Revenue Recovered</p>
            <p className="text-xs text-primary font-medium mt-1">
              From follow-ups
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowQuickAdd(true)}
            className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon name="plus" size="lg" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Quote</p>
                <p className="text-xs text-gray-500">Create new</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/sequences')}
            className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Icon name="bolt" size="lg" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sequences</p>
                <p className="text-xs text-gray-500">Automations</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/customers')}
            className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Icon name="users" size="lg" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Customers</p>
                <p className="text-xs text-gray-500">View all</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/analytics')}
            className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Icon name="chart" size="lg" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-xs text-gray-500">Reports</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pipeline */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Quote Pipeline</h2>
                <Badge variant="secondary" className="text-xs">
                  {transformedQuotes.length} quotes
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/quotes')}
                className="text-primary hover:text-primary/80"
              >
                View all
                <Icon name="arrowRight" size="sm" className="ml-1" />
              </Button>
            </div>
            
            <div className="card-elevated p-0 overflow-hidden">
              <QuotePipeline quotes={transformedQuotes} onQuoteClick={handleQuoteClick} />
            </div>
          </div>
          
          {/* Activity + AI Insights */}
          <div className="space-y-6">
            {/* AI Insights Card */}
            <div className="card-feature p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-[#9D96FF]">
                  <Icon name="sparkles" size="lg" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Insights</h3>
                  <p className="text-xs text-gray-500">Smart recommendations</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <Icon name="clock" size="sm" className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">3 quotes need follow-up</p>
                    <p className="text-xs text-amber-700">No response in 48+ hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <Icon name="checkCircle" size="sm" className="text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">High win probability</p>
                    <p className="text-xs text-emerald-700">2 quotes likely to convert</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Icon name="send" size="sm" className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">5 messages sent today</p>
                    <p className="text-xs text-blue-700">Automated follow-ups working</p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 text-primary hover:text-primary/80 hover:bg-primary/5"
                onClick={() => router.push('/analytics')}
              >
                View detailed insights
                <Icon name="arrowRight" size="sm" className="ml-1" />
              </Button>
            </div>
            
            {/* Recent Activity */}
            <RecentActivity activities={transformedActivities} />
          </div>
        </div>
        
      </div>
      
      {/* Quick Add Quote Modal */}
      <QuickAddQuote 
        open={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
      />
    </Layout>
  );
}
