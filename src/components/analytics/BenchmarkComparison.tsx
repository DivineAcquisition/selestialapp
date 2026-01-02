import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Metric } from '@/hooks/useAnalytics';

interface BenchmarkComparisonProps {
  metrics: Metric[];
}

export default function BenchmarkComparison({ metrics }: BenchmarkComparisonProps) {
  const getProgressColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-amber-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage': return `${value.toFixed(1)}%`;
      case 'currency': return `$${value.toLocaleString()}`;
      case 'duration':
        if (value < 60) return `${Math.round(value)}m`;
        return `${(value / 60).toFixed(1)}h`;
      default: return value.toFixed(1);
    }
  };

  // Calculate progress percentage relative to excellent threshold
  const getProgress = (metric: Metric) => {
    const { current_value, benchmark_excellent } = metric;
    if (benchmark_excellent === 0) return 0;
    return Math.min((current_value / benchmark_excellent) * 100, 100);
  };

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-4">Performance vs Industry Benchmarks</h3>
      <div className="space-y-4">
        {metrics.slice(0, 5).map((metric) => (
          <div key={metric.metric_key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{metric.metric_name}</span>
              <span className={cn(
                'text-sm font-semibold',
                metric.performance_level === 'excellent' && 'text-emerald-600',
                metric.performance_level === 'good' && 'text-blue-600',
                metric.performance_level === 'average' && 'text-amber-600',
                metric.performance_level === 'poor' && 'text-red-600',
              )}>
                {formatValue(metric.current_value, metric.display_format)}
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={getProgress(metric)} 
                className="h-2"
              />
              <div 
                className="absolute top-0 h-2 w-0.5 bg-muted-foreground/50"
                style={{ left: `${(metric.benchmark_avg / metric.benchmark_excellent) * 100}%` }}
                title={`Industry avg: ${formatValue(metric.benchmark_avg, metric.display_format)}`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>Avg: {formatValue(metric.benchmark_avg, metric.display_format)}</span>
              <span>Top: {formatValue(metric.benchmark_excellent, metric.display_format)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
