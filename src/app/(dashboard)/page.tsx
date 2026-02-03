"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import QuotePipeline from '@/components/dashboard/QuotePipeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickAddQuote from '@/components/quotes/QuickAddQuote';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  // AI Insights - could be dynamic later
  const insights = [
    {
      id: '1',
      type: 'warning' as const,
      title: '3 quotes need follow-up',
      description: 'No response in 48+ hours',
      action: {
        label: 'View quotes',
        onClick: () => router.push('/quotes?status=active'),
      },
    },
    {
      id: '2',
      type: 'success' as const,
      title: 'High win probability',
      description: '2 quotes likely to convert this week',
    },
    {
      id: '3',
      type: 'info' as const,
      title: '5 messages sent today',
      description: 'Automated follow-ups working',
    },
  ];
  
  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Hero Section */}
        <DashboardHero
          ownerName={business?.owner_name}
          activeQuotes={stats.activeQuotes}
          conversionTrend={5}
          onNewQuote={() => setShowQuickAdd(true)}
          onOpenInbox={() => router.push('/inbox')}
        />
        
        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Quotes"
            value={stats.activeQuotes}
            icon="fileText"
            color="primary"
            onClick={() => router.push('/quotes?status=active')}
          />
          
          <StatCard
            title="Conversion Rate"
            value={stats.conversionRate}
            icon="trendingUp"
            color="emerald"
            suffix="%"
            trend={{ value: 5, label: 'vs last month' }}
          />
          
          <StatCard
            title="Won This Month"
            value={stats.wonCount}
            icon="target"
            color="amber"
            onClick={() => router.push('/quotes?status=won')}
            description={formatCurrency(stats.wonAmount)}
          />
          
          <StatCard
            title="Revenue Recovered"
            value={stats.revenueRecovered}
            icon="dollar"
            color="primary"
            format="currency"
            badge="Follow-ups"
          />
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Add Quote"
            description="Create new"
            icon="plus"
            color="primary"
            onClick={() => setShowQuickAdd(true)}
          />
          
          <QuickActionCard
            title="Sequences"
            description="Automations"
            icon="bolt"
            color="purple"
            onClick={() => router.push('/sequences')}
          />
          
          <QuickActionCard
            title="Customers"
            description="View all"
            icon="users"
            color="blue"
            onClick={() => router.push('/customers')}
          />
          
          <QuickActionCard
            title="Analytics"
            description="Reports"
            icon="chart"
            color="emerald"
            onClick={() => router.push('/analytics')}
          />
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
            
            <div className="card-elevated p-0 overflow-hidden ring-1 ring-white/50">
              <QuotePipeline quotes={transformedQuotes} onQuoteClick={handleQuoteClick} />
            </div>
          </div>
          
          {/* Activity + AI Insights */}
          <div className="space-y-6">
            {/* AI Insights Card */}
            <AIInsights 
              insights={insights} 
              onViewAll={() => router.push('/analytics')} 
            />
            
            {/* Recent Activity */}
            <RecentActivity activities={transformedActivities} />
          </div>
        </div>
        
        {/* Additional Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            onClick={() => router.push('/bookings')}
            className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all ring-1 ring-white/50"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors mb-2">
              <Icon name="calendar" size="lg" />
            </div>
            <span className="text-sm font-medium text-gray-900">Bookings</span>
          </button>
          
          <button
            onClick={() => router.push('/payments')}
            className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all ring-1 ring-white/50"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors mb-2">
              <Icon name="creditCard" size="lg" />
            </div>
            <span className="text-sm font-medium text-gray-900">Payments</span>
          </button>
          
          <button
            onClick={() => router.push('/campaigns')}
            className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all ring-1 ring-white/50"
          >
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors mb-2">
              <Icon name="megaphone" size="lg" />
            </div>
            <span className="text-sm font-medium text-gray-900">Campaigns</span>
          </button>
          
          <button
            onClick={() => router.push('/retention')}
            className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all ring-1 ring-white/50"
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors mb-2">
              <Icon name="heart" size="lg" />
            </div>
            <span className="text-sm font-medium text-gray-900">Retention</span>
          </button>
          
          <button
            onClick={() => router.push('/connections')}
            className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all ring-1 ring-white/50"
          >
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-500 group-hover:text-white transition-colors mb-2">
              <Icon name="plug" size="lg" />
            </div>
            <span className="text-sm font-medium text-gray-900">Integrations</span>
          </button>
          
          <button
            onClick={() => router.push('/settings')}
            className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all ring-1 ring-white/50"
          >
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-500 group-hover:text-white transition-colors mb-2">
              <Icon name="settings" size="lg" />
            </div>
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </button>
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
