import { Card } from '@/components/ui/card';
import { ActivityLog } from '@/types';
import { formatRelativeTime } from '@/lib/formatters';
import { Icon, IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  activities: ActivityLog[];
}

function getActivityConfig(action: string): { icon: IconName; color: string; bg: string; border: string } {
  switch (action) {
    case 'quote_created':
      return { 
        icon: 'filePlus', 
        color: 'text-info',
        bg: 'bg-info/10',
        border: 'border-info/20'
      };
    case 'message_sent':
      return { 
        icon: 'send', 
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20'
      };
    case 'message_delivered':
      return { 
        icon: 'checkCircle', 
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20'
      };
    case 'status_won':
      return { 
        icon: 'trophy', 
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20'
      };
    case 'status_lost':
      return { 
        icon: 'xCircle', 
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/20'
      };
    case 'sequence_completed':
      return { 
        icon: 'clock', 
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        border: 'border-border'
      };
    default:
      return { 
        icon: 'message', 
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        border: 'border-border'
      };
  }
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon name="activity" size="sm" className="text-primary" />
        </div>
        <h3 className="font-semibold text-lg text-foreground">Recent Activity</h3>
      </div>
      
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mb-3">
            <Icon name="activity" size="xl" className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
          <p className="text-xs text-muted-foreground mt-1">Activity will appear here as you work</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const config = getActivityConfig(activity.action);
            
            return (
              <div 
                key={activity.id} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-colors",
                  "hover:bg-secondary/50 group animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "p-2 rounded-lg border",
                  config.bg,
                  config.border
                )}>
                  <Icon name={config.icon} size="sm" className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
