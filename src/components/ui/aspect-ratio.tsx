"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  children?: React.ReactNode;
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, className, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        style={{
          paddingBottom: `${100 / ratio}%`,
          ...style,
        }}
        data-slot="aspect-ratio"
        {...props}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    );
  }
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
