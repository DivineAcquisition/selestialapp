"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartCard } from "@/components/ui/chart-card";

interface ServiceData {
  name: string;
  revenue: number;
  bookings: number;
}

interface ServicePerformanceBarProps {
  data: ServiceData[];
  isLoading?: boolean;
}

const COLORS = [
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ec4899", // pink
  "#06b6d4", // cyan
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium mb-2">{label}</p>
      <p className="text-sm">
        Revenue: <span className="font-medium">${payload[0]?.value?.toLocaleString()}</span>
      </p>
      {payload[0]?.payload?.bookings && (
        <p className="text-sm text-muted-foreground">
          {payload[0].payload.bookings} bookings
        </p>
      )}
    </div>
  );
};

export function ServicePerformanceBar({ data, isLoading }: ServicePerformanceBarProps) {
  return (
    <ChartCard
      title="Revenue by Service Type"
      description="Top performing services"
      isLoading={isLoading}
    >
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
