"use client";

import { Icon, IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "warning" | "success" | "info" | "urgent";
  title: string;
  description: string;
  icon?: IconName;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AIInsightsProps {
  insights: Insight[];
  onViewAll?: () => void;
  loading?: boolean;
}

const typeConfig = {
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "alertCircle" as IconName,
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
    descColor: "text-amber-700",
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "checkCircle" as IconName,
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
    descColor: "text-emerald-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "info" as IconName,
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
    descColor: "text-blue-700",
  },
  urgent: {
    bg: "bg-red-50",
    border: "border-red-100",
    icon: "alertTriangle" as IconName,
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    descColor: "text-red-700",
  },
};

export function AIInsights({ insights, onViewAll, loading }: AIInsightsProps) {
  if (loading) {
    return (
      <div className="card-feature p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-[#9D96FF]">
            <Icon name="sparkles" size="lg" className="text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Insights</h3>
            <p className="text-xs text-gray-500">Analyzing your data...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-feature p-5 ring-1 ring-white/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-[#9D96FF] ring-2 ring-white/30">
          <Icon name="sparkles" size="lg" className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
          <p className="text-xs text-gray-500">Smart recommendations</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon name="checkCircle" size="2xl" className="text-emerald-500 mb-2" />
          <p className="text-sm font-medium text-gray-900">All caught up!</p>
          <p className="text-xs text-gray-500">No urgent insights right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.slice(0, 4).map((insight) => {
            const config = typeConfig[insight.type];
            return (
              <div
                key={insight.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                  config.bg,
                  config.border,
                  "hover:shadow-sm"
                )}
              >
                <Icon
                  name={insight.icon || config.icon}
                  size="sm"
                  className={cn("mt-0.5 shrink-0", config.iconColor)}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", config.titleColor)}>
                    {insight.title}
                  </p>
                  <p className={cn("text-xs", config.descColor)}>
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button
                      onClick={insight.action.onClick}
                      className={cn(
                        "text-xs font-medium mt-1.5 hover:underline",
                        config.iconColor
                      )}
                    >
                      {insight.action.label} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {onViewAll && insights.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 text-primary hover:text-primary/80 hover:bg-primary/5"
          onClick={onViewAll}
        >
          View detailed insights
          <Icon name="arrowRight" size="sm" className="ml-1" />
        </Button>
      )}
    </div>
  );
}
