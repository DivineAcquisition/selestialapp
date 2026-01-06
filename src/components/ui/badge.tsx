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
          "border-[#5500FF] bg-[#5500FF]/10 text-[#5500FF] shadow-[0_0_10px_hsl(260_100%_50%/0.3)]",
        "neon-purple": 
          "border-[#9D96FF] bg-[#9D96FF]/10 text-[#9D96FF] shadow-[0_0_10px_hsl(244_100%_80%/0.3)]",
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
