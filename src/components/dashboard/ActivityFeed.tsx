import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "message_sent" | "quote_won" | "quote_lost" | "quote_created" | "sequence_started";
  description: string;
  time: string;
  customer?: string;
}

const activityConfig = {
  message_sent: { icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
  quote_won: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  quote_lost: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  quote_created: { icon: Plus, color: "text-accent-foreground", bg: "bg-accent" },
  sequence_started: { icon: Zap, color: "text-warning", bg: "bg-warning/10" },
};

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "message_sent",
    description: "Follow-up SMS sent",
    time: "5 min ago",
    customer: "Sarah Williams",
  },
  {
    id: "2",
    type: "quote_won",
    description: "Quote converted to job",
    time: "1 hour ago",
    customer: "Emily Rodriguez",
  },
  {
    id: "3",
    type: "sequence_started",
    description: "Follow-up sequence started",
    time: "2 hours ago",
    customer: "David Chen",
  },
  {
    id: "4",
    type: "quote_created",
    description: "New quote added",
    time: "3 hours ago",
    customer: "Lisa Thompson",
  },
  {
    id: "5",
    type: "quote_lost",
    description: "Quote marked as lost",
    time: "5 hours ago",
    customer: "James Wilson",
  },
];

export function ActivityFeed() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">What is happening with your quotes</p>
      </div>
      
      <div className="p-4 space-y-1">
        {mockActivities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Icon size={16} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">{activity.customer}</span>
                  <span className="text-muted-foreground"> • {activity.description}</span>
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
