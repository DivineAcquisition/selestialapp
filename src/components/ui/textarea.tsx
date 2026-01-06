import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm ring-offset-background transition-all duration-200",
          "placeholder:text-muted-foreground/70",
          "hover:border-muted-foreground/30 hover:bg-secondary/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 focus-visible:bg-background",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input disabled:hover:bg-secondary/50",
          "resize-none",
          error && "border-destructive/50 focus-visible:ring-destructive",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
