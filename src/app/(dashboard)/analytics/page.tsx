"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { AnimatedCounter } from '@/components/ui/text-effects';
import { useAnalytics, useMetricsSummary } from '@/hooks/useAnalytics';
import {
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-500">Track performance against industry benchmarks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly')}>
              <SelectTrigger className="w-36 bg-white rounded-xl">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
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
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary Stats - Bento Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group card-elevated p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Target className="w-5 h-5" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                    +5%
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  <AnimatedCounter value={summary?.winRate || 0} suffix="%" />
                </div>
                <p className="text-sm text-gray-500">Win Rate</p>
              </div>
              
              <div className="group card-elevated p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${((summary?.totalRevenue || 0) / 100).toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
              
              <div className="group card-elevated p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  <AnimatedCounter value={summary?.totalCustomers || 0} />
                </div>
                <p className="text-sm text-gray-500">Customers</p>
              </div>
              
              <div className="group card-elevated p-5 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  <AnimatedCounter value={summary?.recurringRate || 0} suffix="%" />
                </div>
                <p className="text-sm text-gray-500">Recurring Rate</p>
              </div>
            </div>

            {/* Insights */}
            {alerts && alerts.length > 0 && (
              <InsightsPanel alerts={alerts} onDismiss={dismissAlert} />
            )}

            {/* Metrics Tabs */}
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="bg-gray-100/80 p-1 rounded-xl">
                <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="revenue" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Revenue
                </TabsTrigger>
                <TabsTrigger value="retention" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Retention
                </TabsTrigger>
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
                <Card className="card-elevated p-0 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Win Rate Trend</h3>
                  </div>
                  <div className="p-5">
                    <PerformanceChart
                      data={metricsHistory}
                      metric="quote_win_rate"
                      title=""
                    />
                  </div>
                </Card>
              )}
              <Card className="card-elevated p-0 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Industry Benchmarks</h3>
                </div>
                <div className="p-5">
                  <BenchmarkComparison metrics={currentMetrics} />
                </div>
              </Card>
            </div>

            {metricsHistory && metricsHistory.length > 0 && (
              <Card className="card-elevated p-0 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                </div>
                <div className="p-5">
                  <PerformanceChart
                    data={metricsHistory}
                    metric="total_revenue"
                    title=""
                  />
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
