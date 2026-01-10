"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartCard } from "@/components/ui/chart-card";
import { Badge } from "@/components/ui/badge";

interface StatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface BookingStatusDonutProps {
  data: StatusData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <p className="text-sm font-medium">{payload[0].name}</p>
      </div>
      <p className="text-lg font-bold mt-1">{payload[0].value}</p>
    </div>
  );
};

export function BookingStatusDonut({ data, isLoading }: BookingStatusDonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      title="Today's Bookings"
      description="Current booking status"
      isLoading={isLoading}
    >
      <div className="h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
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
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {data.map((item, index) => (
          <Badge 
            key={index} 
            variant="outline"
            className="gap-2"
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            {item.name}: {item.value}
          </Badge>
        ))}
      </div>
    </ChartCard>
  );
}
