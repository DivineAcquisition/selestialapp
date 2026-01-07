"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => innerRef.current!);

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
            "h-4 w-4 shrink-0 rounded border-2 border-gray-300 bg-white",
            "flex items-center justify-center",
            "transition-all duration-200",
            "peer-hover:border-gray-400",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:border-primary",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "peer-checked:bg-primary peer-checked:border-primary",
            className
          )}
          onClick={() => innerRef.current?.click()}
        >
          {isChecked && <Icon name="check" size="xs" className="text-white" />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
