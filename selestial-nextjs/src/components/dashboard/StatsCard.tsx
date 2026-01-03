import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'default' | 'success' | 'warning' | 'danger';
}

const accentStyles = {
  default: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
  },
  success: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
  danger: {
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'default',
}: StatsCardProps) {
  const accent = accentStyles[accentColor];
  
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-emerald-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        
        <div className={cn("p-2.5 rounded-lg", accent.bg)}>
          <Icon className={cn("h-5 w-5", accent.text)} />
        </div>
      </div>
    </Card>
  );
}
