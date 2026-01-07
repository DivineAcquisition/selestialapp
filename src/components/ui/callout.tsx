"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const calloutVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-8 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-gray-50 border-gray-200 text-gray-700",
        info: "bg-blue-50 border-blue-200 text-blue-700",
        success: "bg-green-50 border-green-200 text-green-700",
        warning: "bg-amber-50 border-amber-200 text-amber-700",
        error: "bg-red-50 border-red-200 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  icon?: React.ReactNode;
  title?: string;
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, icon, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(calloutVariants({ variant }), className)}
        {...props}
      >
        {icon}
        <div>
          {title && <p className="font-medium mb-1">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    );
  }
);
Callout.displayName = "Callout";

export { Callout, calloutVariants };
