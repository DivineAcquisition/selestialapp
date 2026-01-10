"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md shadow-destructive/20 hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/30",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]",
        glow:
          "bg-primary text-primary-foreground shadow-md shadow-primary/40 hover:shadow-lg hover:shadow-primary/50 hover:bg-primary/90",
        success:
          "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);
EnhancedButton.displayName = "EnhancedButton";

// Icon Button with tooltip
interface IconButtonProps extends EnhancedButtonProps {
  tooltip?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, tooltip, children, ...props }, ref) => {
    return (
      <EnhancedButton
        ref={ref}
        size="icon"
        variant="ghost"
        className={cn(
          "rounded-lg hover:bg-accent hover:text-accent-foreground",
          className
        )}
        title={tooltip}
        {...props}
      >
        {children}
      </EnhancedButton>
    );
  }
);
IconButton.displayName = "IconButton";

// Floating Action Button
interface FABProps extends EnhancedButtonProps {
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, position = "bottom-right", children, ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "bottom-center": "fixed bottom-6 left-1/2 -translate-x-1/2",
    };

    return (
      <EnhancedButton
        ref={ref}
        size="xl"
        variant="gradient"
        className={cn(
          positionClasses[position],
          "z-50 shadow-xl rounded-full h-14 w-14 hover:scale-105 active:scale-95 transition-transform",
          className
        )}
        {...props}
      >
        {children}
      </EnhancedButton>
    );
  }
);
FAB.displayName = "FAB";

export { EnhancedButton, IconButton, FAB, buttonVariants };
