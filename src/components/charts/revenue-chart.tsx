"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/ui/chart-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  isLoading?: boolean;
  onPeriodChange?: (period: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="space-y-1">
        <p className="text-sm text-emerald-500">
          Revenue: ${payload[0]?.value?.toLocaleString()}
        </p>
        {payload[1] && (
          <p className="text-sm text-violet-500">
            Bookings: {payload[1]?.value}
          </p>
        )}
      </div>
    </div>
  );
};

export function RevenueChart({ data, isLoading, onPeriodChange }: RevenueChartProps) {
  const [period, setPeriod] = useState("30d");

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <ChartCard
      title="Revenue Overview"
      description="Track your earnings over time"
      isLoading={isLoading}
      action={
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
