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
  accentColor?: 'default' | 'success' | 'warning' | 'danger' | 'neon';
  onClick?: () => void;
}

const accentStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
  },
  success: {
    iconBg: 'bg-success/10',
    iconText: 'text-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconText: 'text-warning',
  },
  danger: {
    iconBg: 'bg-destructive/10',
    iconText: 'text-destructive',
  },
  neon: {
    iconBg: 'bg-[hsl(var(--neon-cyan))]/10',
    iconText: 'text-[hsl(var(--neon-cyan))]',
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
      neon={accentColor === 'neon'}
      className={cn(
        "p-5 transition-all duration-300 hover:shadow-md",
        onClick && "cursor-pointer hover:-translate-y-0.5"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
                trend.isPositive 
                  ? "text-success bg-success/10" 
                  : "text-destructive bg-destructive/10"
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
          "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-300",
          accent.iconBg
        )}>
          <Icon className={cn("h-6 w-6", accent.iconText)} />
        </div>
      </div>
    </Card>
  );
}
