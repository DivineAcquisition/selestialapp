import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Metric } from '@/hooks/useAnalytics';

interface MetricCardProps {
  metric: Metric;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const formatValue = (value: number) => {
    switch (metric.display_format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'duration':
        if (value < 60) return `${Math.round(value)}m`;
        return `${(value / 60).toFixed(1)}h`;
      default:
        return value.toFixed(1);
    }
  };

  const getPerformanceColor = () => {
    switch (metric.performance_level) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'average': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPerformanceLabel = () => {
    switch (metric.performance_level) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'average': return 'Average';
      case 'poor': return 'Needs Work';
      default: return '';
    }
  };

  const isPositiveChange = metric.change_pct > 0;
  const isNegativeChange = metric.change_pct < 0;

  return (
    <Card className={cn('p-4 border', getPerformanceColor())}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{metric.metric_name}</p>
          <p className="text-2xl font-bold mt-1">{formatValue(metric.current_value)}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-background/50">
          {getPerformanceLabel()}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mt-3 text-sm">
        {isPositiveChange && (
          <span className="flex items-center text-emerald-600">
            <Icon name="trendUp" size="xs" className="mr-1" />
            +{metric.change_pct.toFixed(1)}%
          </span>
        )}
        {isNegativeChange && (
          <span className="flex items-center text-red-600">
            <Icon name="trendDown" size="xs" className="mr-1" />
            {metric.change_pct.toFixed(1)}%
          </span>
        )}
        {!isPositiveChange && !isNegativeChange && (
          <span className="flex items-center text-muted-foreground">
            <Icon name="minus" size="xs" className="mr-1" />
            No change
          </span>
        )}
        <span className="text-muted-foreground">vs last period</span>
      </div>

      <div className="mt-3 pt-3 border-t border-current/10">
        <div className="flex justify-between text-xs">
          <span>Industry avg: {formatValue(metric.benchmark_avg)}</span>
          <span>Top tier: {formatValue(metric.benchmark_excellent)}</span>
        </div>
      </div>
    </Card>
  );
}
