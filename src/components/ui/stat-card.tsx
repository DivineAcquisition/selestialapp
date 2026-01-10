"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  format?: "currency" | "number" | "percent";
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  className,
  isLoading,
  format = "number"
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case "percent":
        return `${val}%`;
      default:
        return new Intl.NumberFormat("en-US").format(val);
    }
  };

  const getTrendIcon = () => {
    if (change === undefined || change === null) return <Icon name="minus" className="h-4 w-4 text-muted-foreground" />;
    if (change > 0) return <Icon name="trendUp" className="h-4 w-4 text-emerald-500" />;
    return <Icon name="trendDown" className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return "text-muted-foreground";
    return change > 0 ? "text-emerald-500" : "text-red-500";
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {icon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                {icon}
              </div>
            )}
          </div>
          <div className="mt-2">
            <motion.p 
              className="text-3xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={String(value)}
            >
              {formatValue(value)}
            </motion.p>
          </div>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {change > 0 ? "+" : ""}{change}%
              </span>
              <span className="text-sm text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
