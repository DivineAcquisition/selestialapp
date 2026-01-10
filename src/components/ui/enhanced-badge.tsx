"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border border-amber-200",
        info: "bg-blue-50 text-blue-700 border border-blue-200",
        outline: "border border-input bg-background text-foreground",
        gradient: "bg-gradient-to-r from-primary to-purple-600 text-white",
        glow: "bg-primary/10 text-primary border border-primary/30 shadow-sm shadow-primary/10",
        dot: "bg-transparent text-muted-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-0.5",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
}

const EnhancedBadge = React.forwardRef<HTMLDivElement, EnhancedBadgeProps>(
  ({ className, variant, size, dot, dotColor, icon, pulse, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              pulse && "animate-pulse",
              dotColor || "bg-current"
            )}
          />
        )}
        {icon && <span className="[&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
        {children}
      </div>
    );
  }
);
EnhancedBadge.displayName = "EnhancedBadge";

// Status Badge
type StatusType = "active" | "pending" | "completed" | "cancelled" | "won" | "lost" | "new";

interface StatusBadgeProps extends Omit<EnhancedBadgeProps, "variant"> {
  status: StatusType;
}

const statusConfig: Record<StatusType, { variant: EnhancedBadgeProps["variant"]; label: string; dot?: boolean }> = {
  active: { variant: "info", label: "Active", dot: true },
  pending: { variant: "warning", label: "Pending", dot: true },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  won: { variant: "success", label: "Won" },
  lost: { variant: "destructive", label: "Lost" },
  new: { variant: "gradient", label: "New" },
};

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const config = statusConfig[status];
    return (
      <EnhancedBadge
        ref={ref}
        variant={config.variant}
        dot={config.dot}
        className={className}
        {...props}
      >
        {config.label}
      </EnhancedBadge>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

// Notification Badge
interface NotificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
}

const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ count, max = 99, className, ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count;

    if (count === 0) return null;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1",
          "text-[10px] font-bold text-white bg-destructive rounded-full",
          "animate-in zoom-in-50 duration-200",
          className
        )}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);
NotificationBadge.displayName = "NotificationBadge";

export { EnhancedBadge, StatusBadge, NotificationBadge, badgeVariants };
