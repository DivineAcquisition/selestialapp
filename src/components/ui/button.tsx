"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-default items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium outline-none transition-colors will-change-transform focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-primary/72 bg-primary text-primary-foreground shadow-xs ring-ring/24 outline-primary/72 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-white/32%),inset_0_1px_--theme(--color-white/16%)] not-active:after:pointer-events-none not-active:after:absolute not-active:after:-inset-px not-active:after:rounded-lg not-active:after:shadow-[0_1px_--theme(--color-white/8%)] hover:brightness-112 active:scale-[99%] focus-visible:ring-4",
        gradient:
          "bg-gradient-to-r from-purple-600 to-purple-500 text-white border border-purple-500/50 shadow-md ring-ring/24 outline-purple-500/72 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-white/32%),inset_0_1px_--theme(--color-white/16%)] hover:from-purple-500 hover:to-purple-400 active:scale-[99%] focus-visible:ring-4 hover:shadow-lg transition-all",
        destructive:
          "border border-destructive/72 bg-destructive text-destructive-foreground shadow-xs ring-destructive/24 outline-destructive/72 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-white/32%),inset_0_1px_--theme(--color-white/16%)] not-active:after:pointer-events-none not-active:after:absolute not-active:after:-inset-px not-active:after:rounded-lg not-active:after:shadow-[0_1px_--theme(--color-white/8%)] hover:brightness-112 active:scale-[99%] focus-visible:ring-4",
        outline:
          "border border-input bg-background shadow-xs ring-ring/24 hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs ring-ring/24 hover:bg-secondary/80 focus-visible:ring-[3px]",
        ghost:
          "ring-ring/24 hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px]",
        link: "text-primary underline-offset-4 ring-ring/24 hover:underline focus-visible:ring-[3px]",
      },
      size: {
        default: "relative h-9 px-4 py-2 sm:h-8",
        sm: "h-8 rounded-md px-3 sm:h-7",
        lg: "h-11 rounded-lg px-8 sm:h-10",
        icon: "h-9 w-9 sm:h-8 sm:w-8",
        "icon-sm": "h-8 w-8 sm:h-7 sm:w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  render?: React.ReactElement;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, render, children, ...props }, ref) => {
    // Support asChild by converting to render prop pattern
    const renderElement = asChild && React.isValidElement(children) ? children : render;
    
    if (renderElement) {
      return React.cloneElement(renderElement as React.ReactElement<{ className?: string; ref?: React.Ref<HTMLButtonElement> }>, {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props,
      } as React.HTMLAttributes<HTMLButtonElement>);
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
