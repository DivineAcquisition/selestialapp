"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      className,
      value,
      defaultValue = 0,
      onValueChange,
      min = -Infinity,
      max = Infinity,
      step = 1,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const updateValue = (newValue: number) => {
      const clampedValue = Math.min(Math.max(newValue, min), max);
      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      onValueChange?.(clampedValue);
    };

    const increment = () => updateValue(currentValue + step);
    const decrement = () => updateValue(currentValue - step);

    return (
      <div className={cn("flex items-center", className)}>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-r-none"
          onClick={decrement}
          disabled={disabled || currentValue <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <input
          ref={ref}
          type="number"
          value={currentValue}
          onChange={(e) => updateValue(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            "h-8 w-16 border-y border-input bg-background px-2 text-center text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          )}
          {...props}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-l-none"
          onClick={increment}
          disabled={disabled || currentValue >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);
NumberField.displayName = "NumberField";

export { NumberField };
