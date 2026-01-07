"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
}

const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      className,
      value = 0,
      min = 0,
      max = 100,
      low,
      high,
      optimum,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

    // Determine color based on value ranges
    let color = "bg-primary";
    if (low !== undefined && high !== undefined) {
      if (value < low) {
        color = optimum !== undefined && optimum < low ? "bg-green-500" : "bg-red-500";
      } else if (value > high) {
        color = optimum !== undefined && optimum > high ? "bg-green-500" : "bg-red-500";
      } else {
        color = "bg-yellow-500";
      }
    }

    return (
      <div
        ref={ref}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Meter.displayName = "Meter";

export { Meter };
