"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ChartCard } from "@/components/ui/chart-card";

interface BookingsByType {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface BookingsPieChartProps {
  data: BookingsByType[];
  isLoading?: boolean;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <p className="text-sm font-medium">{payload[0].name}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {payload[0].value} bookings
      </p>
    </div>
  );
};

export function BookingsPieChart({ data, isLoading }: BookingsPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      title="Bookings by Service Type"
      description={`${total} total bookings`}
      isLoading={isLoading}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="stroke-background stroke-2"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
