"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeStyles = {
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-3",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Spinner.displayName = "Spinner";

export { Spinner };
