"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import QuotePipeline from '@/components/dashboard/QuotePipeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import QuickAddQuote from '@/components/quotes/QuickAddQuote';
import { FileText, TrendingUp, Target, DollarSign, Sparkles } from 'lucide-react';
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
  
  const handleAddQuote = () => {
    setShowQuickAdd(true);
  };
  
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
      {/* Welcome section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary animate-pulse-subtle" />
          <span className="text-sm font-medium text-primary">{getGreeting()}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {business?.owner_name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your quotes today
        </p>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Active Quotes"
          value={stats.activeQuotes.toString()}
          subtitle="Awaiting response"
          icon={FileText}
          accentColor="default"
          onClick={() => router.push('/quotes?status=active')}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          subtitle="Last 30 days"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          accentColor="success"
        />
        <StatsCard
          title="Won This Month"
          value={stats.wonCount.toString()}
          subtitle={formatCurrency(stats.wonAmount)}
          icon={Target}
          accentColor="success"
          onClick={() => router.push('/quotes?status=won')}
        />
        <StatsCard
          title="Revenue Recovered"
          value={formatCurrency(stats.revenueRecovered)}
          subtitle="From follow-ups"
          icon={DollarSign}
          accentColor="warning"
        />
      </div>
      
      {/* Quick actions */}
      <QuickActions onAddQuote={handleAddQuote} />
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        {/* Pipeline - takes 2 columns on xl */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Quote Pipeline</h2>
            <button 
              onClick={() => router.push('/quotes')}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View all
            </button>
          </div>
          <QuotePipeline quotes={transformedQuotes} onQuoteClick={handleQuoteClick} />
        </div>
        
        {/* Recent activity - takes 1 column on xl */}
        <div className="xl:col-span-1">
          <RecentActivity activities={transformedActivities} />
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
