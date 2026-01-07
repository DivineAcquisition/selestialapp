"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, defaultChecked, onCheckedChange, onChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(e);
      onCheckedChange?.(newChecked);
    };

    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
            "bg-gray-200 peer-checked:bg-primary",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
            "after:h-5 after:w-5 after:rounded-full after:bg-white",
            "after:shadow-sm after:transition-transform after:duration-200",
            "peer-checked:after:translate-x-5",
            className
          )}
        />
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
