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
  onClick?: () => void;
}

const accentStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
  },
  success: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
  },
  danger: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'default',
  onClick,
}: StatsCardProps) {
  const accent = accentStyles[accentColor];
  
  return (
    <Card 
      className={cn(
        "p-5",
        onClick && "cursor-pointer hover:shadow-md transition-shadow"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend.isPositive 
                  ? "text-green-600" 
                  : "text-red-600"
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
          
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          accent.iconBg
        )}>
          <Icon className={cn("h-5 w-5", accent.iconText)} />
        </div>
      </div>
    </Card>
  );
}
