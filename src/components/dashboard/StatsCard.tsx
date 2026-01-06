import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

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
    border: 'hover:border-primary/30',
    glow: 'group-hover:shadow-primary/5',
  },
  success: {
    iconBg: 'bg-success/10',
    iconText: 'text-success',
    border: 'hover:border-success/30',
    glow: 'group-hover:shadow-success/5',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconText: 'text-warning',
    border: 'hover:border-warning/30',
    glow: 'group-hover:shadow-warning/5',
  },
  danger: {
    iconBg: 'bg-destructive/10',
    iconText: 'text-destructive',
    border: 'hover:border-destructive/30',
    glow: 'group-hover:shadow-destructive/5',
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
        "group relative overflow-hidden p-5 transition-all duration-300",
        accent.border,
        accent.glow,
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
      )}
      onClick={onClick}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-start justify-between">
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
          "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
          accent.iconBg,
          "group-hover:scale-110"
        )}>
          <Icon className={cn("h-6 w-6", accent.iconText)} />
        </div>
      </div>
      
      {/* Click indicator */}
      {onClick && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </Card>
  );
}
