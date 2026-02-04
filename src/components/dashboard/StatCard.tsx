"use client";

import { Icon, IconName } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/text-effects";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  trend?: {
    value: number;
    label: string;
  };
  badge?: string;
  color?: "primary" | "emerald" | "amber" | "blue" | "purple" | "red" | "gray";
  onClick?: () => void;
  format?: "number" | "currency" | "percent";
  prefix?: string;
  suffix?: string;
  description?: string;
}

const colorConfig = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    hoverBg: "group-hover:bg-primary",
    hoverText: "group-hover:text-white",
    badge: "bg-primary/10 text-primary",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    hoverBg: "group-hover:bg-emerald-500",
    hoverText: "group-hover:text-white",
    badge: "bg-emerald-100 text-emerald-700",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    hoverBg: "group-hover:bg-amber-500",
    hoverText: "group-hover:text-white",
    badge: "bg-amber-100 text-amber-700",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    hoverBg: "group-hover:bg-blue-500",
    hoverText: "group-hover:text-white",
    badge: "bg-blue-100 text-blue-700",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    hoverBg: "group-hover:bg-purple-500",
    hoverText: "group-hover:text-white",
    badge: "bg-purple-100 text-purple-700",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    hoverBg: "group-hover:bg-red-500",
    hoverText: "group-hover:text-white",
    badge: "bg-red-100 text-red-700",
  },
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    hoverBg: "group-hover:bg-gray-500",
    hoverText: "group-hover:text-white",
    badge: "bg-gray-100 text-gray-700",
  },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  badge,
  color = "primary",
  onClick,
  format = "number",
  prefix = "",
  suffix = "",
  description,
}: StatCardProps) {
  const colors = colorConfig[color];
  
  const formatValue = () => {
    if (typeof value === "string") return value;
    
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case "percent":
        return `${value}%`;
      default:
        return value;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/50 bg-white p-5",
        "shadow-sm hover:shadow-lg transition-all duration-300",
        "ring-1 ring-gray-100 hover:ring-primary/20",
        onClick && "cursor-pointer"
      )}
    >
      {/* Background Decoration */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-gray-50 to-transparent opacity-50" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              "p-2.5 rounded-xl transition-colors duration-200",
              colors.bg,
              colors.text,
              colors.hoverBg,
              colors.hoverText
            )}
          >
            <Icon name={icon} size="lg" />
          </div>
          
          {badge && (
            <Badge className={cn("text-xs border-0", colors.badge)}>
              {badge}
            </Badge>
          )}
          
          {trend && !badge && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.value >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              <Icon
                name={trend.value >= 0 ? "trendingUp" : "trendingDown"}
                size="xs"
              />
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </div>
          )}
          
          {onClick && !badge && !trend && (
            <Icon
              name="arrowRight"
              size="sm"
              className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
            />
          )}
        </div>
        
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {prefix}
          {typeof value === "number" ? (
            <AnimatedCounter value={value} />
          ) : (
            value
          )}
          {suffix && <span className="text-xl">{suffix}</span>}
        </div>
        
        <p className="text-sm text-gray-500">{title}</p>
        
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
