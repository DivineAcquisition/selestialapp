"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioCardGroupContextValue {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioCardGroupContext = React.createContext<RadioCardGroupContextValue | null>(null);

const useRadioCardGroup = () => {
  const context = React.useContext(RadioCardGroupContext);
  if (!context) {
    throw new Error("RadioCardGroupItem must be used within a RadioCardGroup");
  }
  return context;
};

export interface RadioCardGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioCardGroup = React.forwardRef<HTMLDivElement, RadioCardGroupProps>(
  ({ className, value, defaultValue, onValueChange, name = "radio-card-group", children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value ?? internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <RadioCardGroupContext.Provider value={{ name, value: currentValue, onValueChange: handleValueChange }}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-4", className)}
          {...props}
        >
          {children}
        </div>
      </RadioCardGroupContext.Provider>
    );
  }
);
RadioCardGroup.displayName = "RadioCardGroup";

export interface RadioCardGroupItemProps extends React.HTMLAttributes<HTMLLabelElement> {
  value: string;
  disabled?: boolean;
}

const RadioCardGroupItem = React.forwardRef<HTMLLabelElement, RadioCardGroupItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const context = useRadioCardGroup();
    const isChecked = context.value === value;

    return (
      <label
        ref={ref}
        className={cn(
          "relative flex cursor-pointer rounded-lg border p-4 transition-colors",
          "hover:bg-accent",
          isChecked && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        <input
          type="radio"
          name={context.name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.checked && !disabled) {
              context.onValueChange?.(value);
            }
          }}
          className="sr-only"
        />
        <div className="flex flex-1">{children}</div>
        <div
          className={cn(
            "mt-1 h-4 w-4 rounded-full border",
            isChecked ? "border-primary bg-primary" : "border-muted-foreground"
          )}
        >
          {isChecked && (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
            </div>
          )}
        </div>
      </label>
    );
  }
);
RadioCardGroupItem.displayName = "RadioCardGroupItem";

export { RadioCardGroup, RadioCardGroupItem };
