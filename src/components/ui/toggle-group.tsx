"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

interface ToggleGroupContextValue {
  type: "single" | "multiple";
  value: string[];
  onValueChange: (value: string) => void;
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

const useToggleGroup = () => {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup");
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
    const normalizeValue = (v: string | string[] | undefined): string[] => {
      if (v === undefined) return [];
      return Array.isArray(v) ? v : [v];
    };

    const [internalValue, setInternalValue] = React.useState<string[]>(
      normalizeValue(defaultValue)
    );
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
        value={{ type, value: currentValue, onValueChange: handleValueChange, variant, size }}
      >
        <div
          ref={ref}
          role="group"
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
            variant: variant || context.variant,
            size: size || context.size,
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
