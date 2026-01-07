import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Icon, IconName } from '@/components/ui/icon';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: IconName;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  glow?: boolean;
}

const accentStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    glow: 'glow-border',
  },
  success: {
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600',
    glow: '',
  },
  warning: {
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconText: 'text-yellow-600',
    glow: '',
  },
  danger: {
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconText: 'text-red-600',
    glow: '',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'default',
  onClick,
  glow = false,
}: StatsCardProps) {
  const accent = accentStyles[accentColor];
  
  return (
    <Card 
      className={cn(
        "p-5 card-glow",
        onClick && "cursor-pointer",
        glow && accent.glow
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                trend.isPositive 
                  ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400" 
                  : "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
              )}>
                <Icon 
                  name={trend.isPositive ? "trendUp" : "trendDown"} 
                  size="xs" 
                />
                {trend.value}%
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl transition-transform group-hover:scale-105",
          accent.iconBg
        )}>
          <Icon name={icon} size="xl" className={accent.iconText} />
        </div>
      </div>
    </Card>
  );
}
