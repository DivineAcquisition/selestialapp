import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import QuotePipeline from '@/components/dashboard/QuotePipeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import { FileText, TrendingUp, Target, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { mockQuotes, mockActivities, mockBusiness, getDashboardStats } from '@/lib/mockData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const stats = getDashboardStats();
  
  const handleAddQuote = () => {
    // TODO: Open add quote modal
    navigate('/quotes');
  };
  
  const handleQuoteClick = (quoteId: string) => {
    navigate(`/quotes?id=${quoteId}`);
  };
  
  return (
    <Layout title="Dashboard">
      {/* Welcome message */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Welcome back, {mockBusiness.owner_name}
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
        <QuotePipeline quotes={mockQuotes} onQuoteClick={handleQuoteClick} />
      </div>
      
      {/* Recent activity */}
      <div className="mt-8">
        <RecentActivity activities={mockActivities} />
      </div>
    </Layout>
  );
}
