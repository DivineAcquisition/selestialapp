"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  unstyled?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, unstyled, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          !unstyled && [
            "flex min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "transition-all duration-200",
            "hover:border-gray-300",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
            "resize-none",
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
