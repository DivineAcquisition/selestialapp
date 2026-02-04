"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
import { StatCard } from '@/components/ui/stat-card';
import { 
  RevenueChart, 
  BookingsPieChart, 
  ServicePerformanceBar, 
  CustomerGrowthChart,
  BookingStatusDonut,
  WeeklyHeatmap 
} from '@/components/charts';
// AnimatedCounter available for future use
import { Icon } from '@/components/ui/icon';
import { useAnalytics, useMetricsSummary } from '@/hooks/useAnalytics';

// Generate sample data for charts
const generateRevenueData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 2000) + 500,
      bookings: Math.floor(Math.random() * 15) + 5,
    });
  }
  return data;
};

const bookingsByType = [
  { name: "Standard", value: 45, color: "#8b5cf6" },
  { name: "Deep Clean", value: 28, color: "#10b981" },
  { name: "Move Out", value: 15, color: "#f59e0b" },
  { name: "Airbnb", value: 12, color: "#3b82f6" },
];

const servicePerformance = [
  { name: "Standard", revenue: 12500, bookings: 45 },
  { name: "Deep Clean", revenue: 9800, bookings: 28 },
  { name: "Move Out", revenue: 6200, bookings: 15 },
  { name: "Airbnb", revenue: 4800, bookings: 12 },
  { name: "Post-Const", revenue: 2200, bookings: 5 },
];

const customerGrowth = [
  { month: "Jul", newCustomers: 12, recurringCustomers: 45, churned: 3 },
  { month: "Aug", newCustomers: 18, recurringCustomers: 52, churned: 4 },
  { month: "Sep", newCustomers: 15, recurringCustomers: 58, churned: 2 },
  { month: "Oct", newCustomers: 22, recurringCustomers: 63, churned: 5 },
  { month: "Nov", newCustomers: 19, recurringCustomers: 71, churned: 3 },
  { month: "Dec", newCustomers: 25, recurringCustomers: 78, churned: 4 },
];

const bookingStatus = [
  { name: "Scheduled", value: 8, color: "#8b5cf6" },
  { name: "In Progress", value: 3, color: "#3b82f6" },
  { name: "Completed", value: 12, color: "#10b981" },
  { name: "Cancelled", value: 1, color: "#ef4444" },
];

// Generate heatmap data
const generateHeatmapData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 7);
  const data: { day: string; hour: number; value: number }[] = [];
  
  days.forEach(day => {
    hours.forEach(hour => {
      // More bookings during mid-day on weekdays
      let baseValue = 0;
      if (day !== "Sun" && day !== "Sat") {
        if (hour >= 9 && hour <= 15) {
          baseValue = 8;
        } else {
          baseValue = 3;
        }
      } else {
        if (hour >= 10 && hour <= 14) {
          baseValue = 5;
        } else {
          baseValue = 1;
        }
      }
      data.push({
        day,
        hour,
        value: Math.floor(Math.random() * baseValue) + Math.floor(baseValue / 2),
      });
    });
  });
  
  return data;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    isLoading, 
  } = useAnalytics(period);
  const { data: summary } = useMetricsSummary();

  // Memoize generated data
  const revenueData = useMemo(() => generateRevenueData(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="chart" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-500">Comprehensive business insights and metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100/80 p-1 rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="detailed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Detailed
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly')}>
              <SelectTrigger className="w-36 bg-white rounded-xl">
                <Icon name="calendar" size="sm" className="mr-2 text-gray-400" />
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
            <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
            >
              <StatCard
                title="Total Revenue"
                value={summary?.totalRevenue ? summary.totalRevenue / 100 : 24580}
                change={12.5}
                changeLabel="vs last month"
                icon={<Icon name="dollar" className="h-4 w-4 text-primary" />}
                format="currency"
              />
              <StatCard
                title="Bookings"
                value={156}
                change={8.2}
                changeLabel="vs last month"
                icon={<Icon name="calendar" className="h-4 w-4 text-primary" />}
              />
              <StatCard
                title="Active Customers"
                value={summary?.totalCustomers || 89}
                change={-2.1}
                changeLabel="vs last month"
                icon={<Icon name="users" className="h-4 w-4 text-primary" />}
              />
              <StatCard
                title="Win Rate"
                value={summary?.winRate || 68}
                change={5.3}
                icon={<Icon name="target" className="h-4 w-4 text-primary" />}
                format="percent"
              />
              <StatCard
                title="Completion Rate"
                value={98.5}
                change={1.2}
                icon={<Icon name="check" className="h-4 w-4 text-primary" />}
                format="percent"
              />
              <StatCard
                title="Recurring Rate"
                value={summary?.recurringRate || 45}
                change={3.8}
                changeLabel="growth"
                icon={<Icon name="repeat" className="h-4 w-4 text-primary" />}
                format="percent"
              />
            </motion.div>

            {/* Main Charts Row */}
            <div className="grid gap-6 lg:grid-cols-7">
              <div className="lg:col-span-4">
                <RevenueChart data={revenueData} />
              </div>
              <div className="lg:col-span-3">
                <BookingsPieChart data={bookingsByType} />
              </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <ServicePerformanceBar data={servicePerformance} />
              <BookingStatusDonut data={bookingStatus} />
              <WeeklyHeatmap data={heatmapData} />
            </div>

            {/* Customer Growth */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CustomerGrowthChart data={customerGrowth} />
              
              {/* Quick Insights Card */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Icon name="sparkles" className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold">AI Insights</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Icon name="trendUp" className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-900">Revenue trending up</p>
                        <p className="text-sm text-emerald-700 mt-1">
                          Your revenue has increased 12.5% compared to last month. Deep cleaning services are driving growth.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-violet-100 rounded-lg">
                        <Icon name="users" className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-violet-900">Customer retention opportunity</p>
                        <p className="text-sm text-violet-700 mt-1">
                          15 customers have not booked in 30+ days. Consider sending a win-back campaign.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Icon name="clock" className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Peak hours identified</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Tuesday and Wednesday 10am-2pm are your busiest times. Consider premium pricing for these slots.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Metrics Section */}
            {activeTab === "detailed" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Detailed Performance Metrics</h2>
                
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: "Quote Response Time", value: "2.4h", change: -15, desc: "Average time to respond" },
                        { title: "Quote Approval Rate", value: "72%", change: 8, desc: "Quotes converted to jobs" },
                        { title: "Job Completion Rate", value: "98.5%", change: 2, desc: "Jobs completed on time" },
                        { title: "Customer Satisfaction", value: "4.9", change: 0.2, desc: "Average rating" },
                      ].map((metric, i) => (
                        <Card key={i} className="p-5 hover:shadow-md transition-shadow">
                          <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                          <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold">{metric.value}</p>
                            <Badge className={metric.change > 0 ? "bg-emerald-100 text-emerald-700 border-0" : "bg-red-100 text-red-700 border-0"}>
                              {metric.change > 0 ? "+" : ""}{metric.change}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{metric.desc}</p>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="revenue" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: "Average Job Value", value: "$185", change: 12, desc: "Per booking" },
                        { title: "Monthly Recurring", value: "$8,450", change: 18, desc: "From subscriptions" },
                        { title: "Upsell Revenue", value: "$2,340", change: 25, desc: "Add-on services" },
                        { title: "Lifetime Value", value: "$1,250", change: 8, desc: "Average per customer" },
                      ].map((metric, i) => (
                        <Card key={i} className="p-5 hover:shadow-md transition-shadow">
                          <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                          <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold">{metric.value}</p>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                              +{metric.change}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{metric.desc}</p>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="retention" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: "Repeat Customer Rate", value: "68%", change: 5, desc: "Customers who rebook" },
                        { title: "Churn Rate", value: "4.2%", change: -2, desc: "Monthly customer loss" },
                        { title: "Referral Rate", value: "23%", change: 8, desc: "Customers from referrals" },
                        { title: "NPS Score", value: "72", change: 5, desc: "Net Promoter Score" },
                      ].map((metric, i) => (
                        <Card key={i} className="p-5 hover:shadow-md transition-shadow">
                          <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                          <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold">{metric.value}</p>
                            <Badge className={metric.change > 0 || (metric.title === "Churn Rate" && metric.change < 0) ? "bg-emerald-100 text-emerald-700 border-0" : "bg-red-100 text-red-700 border-0"}>
                              {metric.change > 0 ? "+" : ""}{metric.change}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{metric.desc}</p>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
