"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary/90 active:bg-primary/95",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-500",
        outline:
          "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost:
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link:
          "text-primary underline-offset-4 hover:underline",
        // ===== 3D Lovable-style variants =====
        // Inspired by Lovable.app — soft inner highlight, bottom "lip" shadow,
        // tactile press animation. Uses primary brand color.
        lovable:
          "relative bg-gradient-to-b from-primary to-[#6d28d9] text-white font-semibold " +
          "border border-[#5b21b6]/60 " +
          "shadow-[0_4px_0_0_#4c1d95,0_6px_16px_-4px_rgba(124,58,237,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)] " +
          "hover:shadow-[0_5px_0_0_#4c1d95,0_8px_22px_-4px_rgba(124,58,237,0.6),inset_0_1px_0_0_rgba(255,255,255,0.3)] " +
          "hover:-translate-y-[1px] " +
          "active:translate-y-[3px] active:shadow-[0_1px_0_0_#4c1d95,0_2px_6px_-2px_rgba(124,58,237,0.4),inset_0_1px_0_0_rgba(255,255,255,0.15)] " +
          "transition-[transform,box-shadow] duration-150 ease-out",
        "lovable-light":
          "relative bg-gradient-to-b from-white to-gray-50 text-gray-900 font-semibold " +
          "border border-gray-200 " +
          "shadow-[0_3px_0_0_#e5e7eb,0_4px_10px_-2px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)] " +
          "hover:shadow-[0_4px_0_0_#e5e7eb,0_6px_14px_-2px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.95)] " +
          "hover:-translate-y-[1px] " +
          "active:translate-y-[2px] active:shadow-[0_1px_0_0_#e5e7eb,0_2px_4px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.7)] " +
          "transition-[transform,box-shadow] duration-150 ease-out",
        "lovable-dark":
          "relative bg-gradient-to-b from-gray-900 to-black text-white font-semibold " +
          "border border-black/60 " +
          "shadow-[0_4px_0_0_#000,0_6px_16px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)] " +
          "hover:shadow-[0_5px_0_0_#000,0_8px_22px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.15)] " +
          "hover:-translate-y-[1px] " +
          "active:translate-y-[3px] active:shadow-[0_1px_0_0_#000,inset_0_1px_0_0_rgba(255,255,255,0.08)] " +
          "transition-[transform,box-shadow] duration-150 ease-out",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6",
        xl: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
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
