import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import QuotePipeline from '@/components/dashboard/QuotePipeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import QuickAddQuote from '@/components/quotes/QuickAddQuote';
import { FileText, TrendingUp, Target, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useBusiness } from '@/contexts/BusinessContext';
import { useQuotes } from '@/hooks/useQuotes';
import { useActivities } from '@/hooks/useActivities';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Quote, ActivityLog, QuoteStatus } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
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
    navigate(`/quotes?id=${quoteId}`);
  };

  // Transform DB quotes to the expected Quote type format for components
  const transformedQuotes: Quote[] = quotes.map(q => ({
    id: q.id,
    created_at: q.created_at || '',
    updated_at: q.updated_at || '',
    business_id: q.business_id,
    sequence_id: q.sequence_id ?? undefined,
    customer_name: q.customer_name,
    customer_phone: q.customer_phone || '',
    customer_email: q.customer_email ?? undefined,
    service_type: q.service_type || '',
    quote_amount: q.quote_amount || 0,
    description: q.description ?? undefined,
    status: (q.status || 'new') as QuoteStatus,
    status_changed_at: q.created_at || '',
    current_step_index: q.current_step || 0,
    next_message_at: q.next_message_at ?? undefined,
    won_at: q.won_at ?? undefined,
    lost_at: q.lost_at ?? undefined,
    lost_reason: q.lost_reason ?? undefined,
    final_job_amount: q.paid_amount ?? undefined,
  }));

  // Transform DB activities to the expected ActivityLog type format
  const transformedActivities: ActivityLog[] = activities.map(a => ({
    id: a.id,
    created_at: a.created_at || '',
    action: a.action,
    description: a.description || '',
    quote_id: a.entity_id ?? undefined,
  }));
  
  return (
    <Layout title="Dashboard">
      {/* Welcome message */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Welcome back, {business?.owner_name || 'User'}
        </p>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Quotes"
          value={stats.activeQuotes.toString()}
          subtitle="Awaiting response"
          icon={FileText}
          accentColor="default"
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
      
      {/* Pipeline */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quote Pipeline</h2>
        <QuotePipeline quotes={transformedQuotes} onQuoteClick={handleQuoteClick} />
      </div>
      
      {/* Recent activity */}
      <div className="mt-8">
        <RecentActivity activities={transformedActivities} />
      </div>
      
      {/* Quick Add Quote Modal */}
      <QuickAddQuote 
        open={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
      />
    </Layout>
  );
}
