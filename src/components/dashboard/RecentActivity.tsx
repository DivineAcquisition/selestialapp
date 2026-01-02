import { Card } from '@/components/ui/card';
import { ActivityLog } from '@/types';
import { formatRelativeTime } from '@/lib/formatters';
import { 
  FilePlus, 
  Send, 
  CheckCheck, 
  Trophy, 
  XCircle, 
  Clock,
  MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  activities: ActivityLog[];
}

function getActivityIcon(action: string) {
  const iconProps = "w-4 h-4";
  
  switch (action) {
    case 'quote_created':
      return <FilePlus className={cn(iconProps, "text-blue-600")} />;
    case 'message_sent':
      return <Send className={cn(iconProps, "text-indigo-600")} />;
    case 'message_delivered':
      return <CheckCheck className={cn(iconProps, "text-emerald-600")} />;
    case 'status_won':
      return <Trophy className={cn(iconProps, "text-amber-600")} />;
    case 'status_lost':
      return <XCircle className={cn(iconProps, "text-red-600")} />;
    case 'sequence_completed':
      return <Clock className={cn(iconProps, "text-slate-600")} />;
    default:
      return <MessageSquare className={cn(iconProps, "text-gray-600")} />;
  }
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="p-1.5 bg-muted rounded-lg">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
