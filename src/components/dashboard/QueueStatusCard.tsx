import { Card } from '@/components/ui/card';
import { useMessageQueue } from '@/hooks/useMessages';
import { useBusiness } from '@/contexts/BusinessContext';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Send, AlertCircle, Loader2 } from 'lucide-react';

export default function QueueStatusCard() {
  const { business } = useBusiness();
  const { stats, loading } = useMessageQueue(business?.id);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Message Queue</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-muted-foreground">Scheduled</span>
          </div>
          <span className="font-medium">{stats.pending}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Send className="w-4 h-4 text-emerald-500" />
            <span className="text-muted-foreground">Sent</span>
          </div>
          <span className="font-medium">{stats.sent}</span>
        </div>
        
        {stats.failed > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">Failed</span>
            </div>
            <span className="font-medium text-destructive">{stats.failed}</span>
          </div>
        )}
      </div>
      
      {stats.scheduledNext && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Next message: {formatDistanceToNow(new Date(stats.scheduledNext), { addSuffix: true })}
          </p>
        </div>
      )}
    </Card>
  );
}
