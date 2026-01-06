import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: 
          "border-primary/30 bg-primary/10 text-primary",
        secondary: 
          "border-border bg-secondary text-secondary-foreground",
        destructive: 
          "border-destructive/30 bg-destructive/10 text-destructive",
        outline: 
          "border-border bg-transparent text-foreground",
        success: 
          "border-success/30 bg-success/10 text-success",
        warning: 
          "border-warning/30 bg-warning/10 text-warning",
        info: 
          "border-info/30 bg-info/10 text-info",
        neon: 
          "border-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 text-[hsl(var(--neon-cyan))] shadow-[0_0_10px_hsl(var(--neon-cyan)/0.3)]",
        "neon-purple": 
          "border-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple))]/10 text-[hsl(var(--neon-purple))] shadow-[0_0_10px_hsl(var(--neon-purple)/0.3)]",
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
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, size, dot, dotColor, children, ...props }: BadgeProps) {
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
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
