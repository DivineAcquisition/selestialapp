import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import MetricCard from '@/components/analytics/MetricCard';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import BenchmarkComparison from '@/components/analytics/BenchmarkComparison';
import InsightsPanel from '@/components/analytics/InsightsPanel';
import { useAnalytics, useMetricsSummary } from '@/hooks/useAnalytics';
import {
  BarChart3,
  RefreshCw,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const { 
    currentMetrics, 
    metricsHistory, 
    alerts, 
    isLoading, 
    dismissAlert 
  } = useAnalytics(period);
  const { data: summary } = useMetricsSummary();

  const performanceMetrics = currentMetrics.filter(m => m.category === 'performance');
  const revenueMetrics = currentMetrics.filter(m => m.category === 'revenue');
  const retentionMetrics = currentMetrics.filter(m => m.category === 'retention');

  return (
    <Layout title="Analytics">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track performance against industry benchmarks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary?.winRate.toFixed(0) || 0}%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${((summary?.totalRevenue || 0) / 100).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary?.totalCustomers || 0}</p>
                    <p className="text-sm text-muted-foreground">Customers</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary?.recurringRate.toFixed(0) || 0}%</p>
                    <p className="text-sm text-muted-foreground">Recurring</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Insights */}
            {alerts && alerts.length > 0 && (
              <InsightsPanel alerts={alerts} onDismiss={dismissAlert} />
            )}

            {/* Metrics Tabs */}
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="retention">Retention</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {performanceMetrics.map((metric) => (
                    <MetricCard key={metric.metric_key} metric={metric} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {revenueMetrics.map((metric) => (
                    <MetricCard key={metric.metric_key} metric={metric} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="retention" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {retentionMetrics.map((metric) => (
                    <MetricCard key={metric.metric_key} metric={metric} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Charts & Benchmarks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metricsHistory && metricsHistory.length > 0 && (
                <PerformanceChart
                  data={metricsHistory}
                  metric="quote_win_rate"
                  title="Win Rate Trend"
                />
              )}
              <BenchmarkComparison metrics={currentMetrics} />
            </div>

            {metricsHistory && metricsHistory.length > 0 && (
              <PerformanceChart
                data={metricsHistory}
                metric="total_revenue"
                title="Revenue Trend"
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
