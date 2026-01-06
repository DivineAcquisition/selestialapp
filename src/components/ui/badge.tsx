import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: 
          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
        secondary: 
          "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: 
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: 
          "border-border bg-transparent text-foreground hover:bg-secondary",
        success: 
          "border-success/30 bg-success/10 text-success hover:bg-success/20",
        warning: 
          "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20",
        info: 
          "border-info/30 bg-info/10 text-info hover:bg-info/20",
        gradient: 
          "border-0 bg-gradient-to-r from-primary/20 to-accent/20 text-foreground",
        // Solid variants for more prominent badges
        "solid-primary": 
          "border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/25",
        "solid-success": 
          "border-transparent bg-success text-success-foreground shadow-sm shadow-success/25",
        "solid-warning": 
          "border-transparent bg-warning text-warning-foreground shadow-sm shadow-warning/25",
        "solid-destructive": 
          "border-transparent bg-destructive text-destructive-foreground shadow-sm shadow-destructive/25",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, size, icon, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span 
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            dotColor || "bg-current"
          )} 
        />
      )}
      {icon}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
