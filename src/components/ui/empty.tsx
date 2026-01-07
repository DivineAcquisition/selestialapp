"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, icon, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center py-12 px-6",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        )}
        {description && (
          <p className="mb-6 text-sm text-gray-500 max-w-sm">{description}</p>
        )}
        {action}
        {children}
      </div>
    );
  }
);
Empty.displayName = "Empty";

export { Empty };
