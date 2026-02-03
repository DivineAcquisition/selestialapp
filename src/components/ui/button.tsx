"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-md hover:bg-primary/90 active:scale-[0.98] ring-1 ring-white/20",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 active:scale-[0.98] ring-1 ring-white/20",
        outline:
          "border-2 border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 ring-1 ring-white/50",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 ring-1 ring-white/50",
        ghost: 
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link: 
          "text-primary underline-offset-4 hover:underline",
        // New variants with white outlines
        primary:
          "bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-[0.98] ring-2 ring-white/30 hover:ring-white/50",
        success:
          "bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 active:scale-[0.98] ring-2 ring-white/30 hover:ring-white/50",
        warning:
          "bg-amber-500 text-white shadow-lg hover:bg-amber-600 active:scale-[0.98] ring-2 ring-white/30 hover:ring-white/50",
        info:
          "bg-blue-500 text-white shadow-lg hover:bg-blue-600 active:scale-[0.98] ring-2 ring-white/30 hover:ring-white/50",
        dark:
          "bg-gray-900 text-white shadow-lg hover:bg-gray-800 active:scale-[0.98] ring-2 ring-white/20 hover:ring-white/40",
        glass:
          "bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 ring-1 ring-white/30",
        "outline-white":
          "border-2 border-white/80 text-white bg-transparent hover:bg-white/10 ring-1 ring-white/20",
        gradient:
          "bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg hover:shadow-xl active:scale-[0.98] ring-2 ring-white/30",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        xs: "h-7 px-2.5 text-xs rounded-lg",
        sm: "h-9 px-4 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
        "icon-xs": "h-7 w-7 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
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
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg 
            className="animate-spin h-4 w-4 mr-2" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="mr-2 inline-flex">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && (
          <span className="ml-2 inline-flex">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
