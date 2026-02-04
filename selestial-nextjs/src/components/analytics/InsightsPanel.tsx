"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingUp, 
  Award,
  Lightbulb,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PerformanceAlert } from '@/hooks/useAnalytics';

interface InsightsPanelProps {
  alerts: PerformanceAlert[];
  onDismiss: (id: string) => void;
}

export default function InsightsPanel({ alerts, onDismiss }: InsightsPanelProps) {
  const router = useRouter();

  if (alerts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No new insights</p>
        <p className="text-sm text-muted-foreground mt-1">
          Check back later for performance tips
        </p>
      </Card>
    );
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <Award className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCardStyle = (severity: string) => {
    switch (severity) {
      case 'success': return 'border-emerald-200 bg-emerald-50';
      case 'warning': return 'border-amber-200 bg-amber-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Insights & Alerts
      </h3>
      {alerts.map((alert) => (
        <Card key={alert.id} className={cn('p-4', getCardStyle(alert.severity))}>
          <div className="flex items-start gap-3">
            {getIcon(alert.severity)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{alert.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              {alert.action_url && (
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 mt-2"
                  onClick={() => router.push(alert.action_url!)}
                >
                  {alert.action_label || 'Take Action'} →
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss(alert.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
