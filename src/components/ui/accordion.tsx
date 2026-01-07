"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  type: "single" | "multiple";
  collapsible?: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionItem components must be used within an AccordionItem");
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
    {
      type = "single",
      value,
      defaultValue,
      onValueChange,
      collapsible = false,
      className,
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

    const handleValueChange = (newValue: string[]) => {
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
        value={{ value: currentValue, onValueChange: handleValueChange, type, collapsible }}
      >
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: accordionValue } = useAccordion();
    const isOpen = accordionValue.includes(value);

    return (
      <AccordionItemContext.Provider value={{ value, isOpen }}>
        <div
          ref={ref}
          className={cn("border-b", className)}
          data-state={isOpen ? "open" : "closed"}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, onValueChange, type, collapsible } = useAccordion();
  const { value: itemValue, isOpen } = useAccordionItem();

  const handleClick = () => {
    if (isOpen) {
      if (type === "single" && !collapsible) return;
      onValueChange(value.filter((v) => v !== itemValue));
    } else {
      if (type === "single") {
        onValueChange([itemValue]);
      } else {
        onValueChange([...value, itemValue]);
      }
    }
  };

  return (
    <h3 className="flex">
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </h3>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useAccordionItem();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(isOpen ? undefined : 0);

  React.useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (isOpen) {
            setHeight(entry.contentRect.height);
          }
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setHeight(0);
    } else if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all duration-300 ease-in-out",
        className
      )}
      style={{ height: height !== undefined ? `${height}px` : "auto" }}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <div ref={contentRef} className="pb-4 pt-0">
        {children}
      </div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
