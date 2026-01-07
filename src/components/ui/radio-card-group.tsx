"use client";

import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "@/lib/utils";

interface RadioCardGroupProps {
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const RadioCardGroup = React.forwardRef<HTMLDivElement, RadioCardGroupProps>(
  ({ className, onValueChange, ...props }, ref) => {
    const handleValueChange = React.useCallback(
      (value: unknown) => {
        if (onValueChange && typeof value === "string") {
          onValueChange(value);
        }
      },
      [onValueChange]
    );
    
    return (
      <RadioGroupPrimitive
        ref={ref}
        className={cn("grid gap-3", className)}
        onValueChange={handleValueChange}
        {...props}
      />
    );
  }
);
RadioCardGroup.displayName = "RadioCardGroup";

interface RadioCardItemProps {
  className?: string;
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const RadioCardItem = React.forwardRef<HTMLButtonElement, RadioCardItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <RadioPrimitive.Root
        ref={ref}
        className={cn(
          "relative rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200",
          "hover:border-gray-300 hover:shadow-sm",
          "focus:outline-none focus-visible:border-primary/50 focus-visible:shadow-[0_0_0_3px_rgba(85,0,255,0.1)]",
          "data-checked:border-primary data-checked:bg-primary/5",
          "data-checked:shadow-[0_0_0_1px_rgba(85,0,255,0.3)]",
          "cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </RadioPrimitive.Root>
    );
  }
);
RadioCardItem.displayName = "RadioCardItem";

const RadioCardIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 transition-all duration-200",
      "group-data-checked:border-primary group-data-checked:bg-primary",
      className
    )}
    {...props}
  >
    <RadioPrimitive.Indicator className="flex items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-white" />
    </RadioPrimitive.Indicator>
  </div>
));
RadioCardIndicator.displayName = "RadioCardIndicator";

// Enhanced version with built-in layout
interface RadioCardProps {
  value: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

const RadioCard = React.forwardRef<HTMLButtonElement, RadioCardProps>(
  ({ value, title, description, icon, badge, disabled }, ref) => {
    return (
      <RadioPrimitive.Root
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(
          "group relative rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200",
          "hover:border-gray-300 hover:shadow-sm",
          "focus:outline-none focus-visible:border-primary/50 focus-visible:shadow-[0_0_0_3px_rgba(85,0,255,0.1)]",
          "data-checked:border-primary data-checked:bg-primary/5",
          "data-checked:shadow-[0_0_0_1px_rgba(85,0,255,0.3)]",
          "cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Indicator */}
          <div
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 transition-all duration-200 mt-0.5",
              "group-data-checked:border-primary group-data-checked:bg-primary"
            )}
          >
            <RadioPrimitive.Indicator className="flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </RadioPrimitive.Indicator>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {icon && (
                <span className="text-gray-500 group-data-checked:text-primary">
                  {icon}
                </span>
              )}
              <span className="font-medium text-gray-900 group-data-checked:text-primary">
                {title}
              </span>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </RadioPrimitive.Root>
    );
  }
);
RadioCard.displayName = "RadioCard";

export { RadioCardGroup, RadioCardItem, RadioCardIndicator, RadioCard };
