"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, checked, onCheckedChange, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => innerRef.current!);
    
    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const isChecked = checked ?? false;

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={innerRef}
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded border border-input bg-background ring-offset-background",
            "flex items-center justify-center",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground",
            "transition-colors duration-200",
            className
          )}
          onClick={() => innerRef.current?.click()}
        >
          {indeterminate ? (
            <Minus className="h-3 w-3" />
          ) : isChecked ? (
            <Check className="h-3 w-3" />
          ) : null}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
