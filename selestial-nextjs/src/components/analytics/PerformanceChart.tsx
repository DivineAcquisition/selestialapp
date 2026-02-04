import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { BusinessMetrics } from '@/hooks/useAnalytics';

interface PerformanceChartProps {
  data: BusinessMetrics[];
  metric: 'quote_win_rate' | 'total_revenue' | 'customer_retention_rate';
  title: string;
}

export default function PerformanceChart({ data, metric, title }: PerformanceChartProps) {
  const chartData = data.map(d => ({
    date: format(parseISO(d.period_start), 'MMM'),
    value: metric === 'total_revenue' 
      ? (d[metric] || 0) / 100 
      : d[metric] || 0,
  }));

  const formatYAxis = (value: number) => {
    if (metric === 'total_revenue') {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `${value}%`;
  };

  const formatTooltip = (value: number | undefined) => {
    if (value === undefined) return ['', ''];
    if (metric === 'total_revenue') {
      return [`$${value.toLocaleString()}`, 'Revenue'];
    }
    return [`${value.toFixed(1)}%`, title];
  };

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs text-muted-foreground"
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
