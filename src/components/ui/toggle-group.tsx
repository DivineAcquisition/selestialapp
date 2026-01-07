"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";
import type { VariantProps } from "class-variance-authority";

interface ToggleGroupContextValue {
  value: string[];
  onValueChange: (value: string) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

const useToggleGroup = () => {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroup components must be used within a ToggleGroup");
  }
  return context;
};

export interface ToggleGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toggleVariants> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      className,
      variant,
      size,
      type = "single",
      value,
      defaultValue,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const normalizeValue = (val?: string | string[]): string[] => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    };

    const [internalValue, setInternalValue] = React.useState(normalizeValue(defaultValue));
    const isControlled = value !== undefined;
    const currentValue = isControlled ? normalizeValue(value) : internalValue;

    const handleValueChange = (itemValue: string) => {
      let newValue: string[];

      if (type === "single") {
        newValue = currentValue.includes(itemValue) ? [] : [itemValue];
      } else {
        if (currentValue.includes(itemValue)) {
          newValue = currentValue.filter((v) => v !== itemValue);
        } else {
          newValue = [...currentValue, itemValue];
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (type === "single") {
        onValueChange?.(newValue[0] || "");
      } else {
        onValueChange?.(newValue);
      }
    };

    return (
      <ToggleGroupContext.Provider
        value={{ value: currentValue, onValueChange: handleValueChange, variant: variant ?? undefined, size: size ?? undefined }}
      >
        <div
          ref={ref}
          className={cn("flex items-center justify-center gap-1", className)}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, value, ...props }, ref) => {
    const context = useToggleGroup();
    const isPressed = context.value.includes(value);

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isPressed}
        data-state={isPressed ? "on" : "off"}
        className={cn(
          toggleVariants({
            variant: variant ?? context.variant,
            size: size ?? context.size,
          }),
          className
        )}
        onClick={() => context.onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
