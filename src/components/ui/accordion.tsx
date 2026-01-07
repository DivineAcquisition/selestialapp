"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    { className, type = "single", value, defaultValue, onValueChange, collapsible = true, children, ...props },
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
        if (currentValue.includes(itemValue)) {
          newValue = collapsible ? [] : [itemValue];
        } else {
          newValue = [itemValue];
        }
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
      <AccordionContext.Provider
        value={{ value: currentValue, onValueChange: (val) => handleValueChange(val[0] || ""), type }}
      >
        <div ref={ref} className={cn("divide-y divide-gray-200", className)} {...props}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ onItemToggle?: (value: string) => void }>, {
                onItemToggle: handleValueChange,
              });
            }
            return child;
          })}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  value: string;
  onItemToggle?: (value: string) => void;
  disabled?: boolean;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, onItemToggle, disabled, children, ...props }, ref) => {
    const { value: openValues } = useAccordion();
    const isOpen = openValues.includes(value);

    return (
      <div
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        className={cn(disabled && "opacity-50", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(
              child as React.ReactElement<{
                value?: string;
                isOpen?: boolean;
                handleToggle?: () => void;
                disabled?: boolean;
              }>,
              {
                value,
                isOpen,
                handleToggle: () => !disabled && onItemToggle?.(value),
                disabled,
              }
            );
          }
          return child;
        })}
      </div>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  isOpen?: boolean;
  handleToggle?: () => void;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, isOpen, handleToggle, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all text-left w-full text-gray-900",
          "hover:text-gray-700",
          className
        )}
        onClick={handleToggle}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, isOpen, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm text-gray-600 transition-all duration-200",
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
