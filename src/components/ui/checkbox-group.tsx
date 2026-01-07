"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxGroupContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
}

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null);

const useCheckboxGroup = () => {
  const context = React.useContext(CheckboxGroupContext);
  if (!context) {
    throw new Error("CheckboxGroup components must be used within a CheckboxGroup");
  }
  return context;
};

export interface CheckboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ className, value, defaultValue = [], onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (newValue: string[]) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <CheckboxGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div
          ref={ref}
          role="group"
          className={cn("space-y-2", className)}
          {...props}
        >
          {children}
        </div>
      </CheckboxGroupContext.Provider>
    );
  }
);
CheckboxGroup.displayName = "CheckboxGroup";

export interface CheckboxGroupItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function CheckboxGroupItem({ value, children, disabled, className }: CheckboxGroupItemProps) {
  const { value: groupValue, onValueChange } = useCheckboxGroup();
  const isChecked = groupValue.includes(value);

  const handleChange = () => {
    if (disabled) return;
    if (isChecked) {
      onValueChange(groupValue.filter((v) => v !== value));
    } else {
      onValueChange([...groupValue, value]);
    }
  };

  return (
    <label
      className={cn(
        "flex items-center gap-2",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded border border-input bg-background",
          "flex items-center justify-center",
          "transition-colors duration-200",
          isChecked && "border-primary bg-primary text-primary-foreground"
        )}
        onClick={handleChange}
      >
        {isChecked && (
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
          </svg>
        )}
      </div>
      {children}
    </label>
  );
}

export { CheckboxGroup, CheckboxGroupItem, useCheckboxGroup };
