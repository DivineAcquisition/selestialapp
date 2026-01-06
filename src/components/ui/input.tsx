import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = "left", error, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          {iconPosition === "left" && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm ring-offset-background transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "placeholder:text-muted-foreground/70",
              "hover:border-muted-foreground/30 hover:bg-secondary/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 focus-visible:bg-background",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input disabled:hover:bg-secondary/50",
              iconPosition === "left" && "pl-11",
              iconPosition === "right" && "pr-11",
              error && "border-destructive/50 focus-visible:ring-destructive",
              className,
            )}
            ref={ref}
            {...props}
          />
          {iconPosition === "right" && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm ring-offset-background transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/70",
          "hover:border-muted-foreground/30 hover:bg-secondary/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 focus-visible:bg-background",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input disabled:hover:bg-secondary/50",
          error && "border-destructive/50 focus-visible:ring-destructive",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
