"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function Accordion({
  type = "single",
  collapsible = false,
  defaultValue,
  value,
  onValueChange,
  disabled,
  children,
  className,
}: AccordionProps) {
  // Convert Radix-style API to base-ui API
  const defaultExpandedItems = React.useMemo(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  }, [defaultValue]);

  return (
    <AccordionPrimitive.Root
      className={className}
      disabled={disabled}
      multiple={type === "multiple"}
      defaultValue={defaultExpandedItems}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function AccordionItem({
  value,
  disabled,
  className,
  children,
}: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn("border-b", className)}
      data-slot="accordion-item"
    >
      {children}
    </AccordionPrimitive.Item>
  );
}

interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-panel-open]>svg]:rotate-180",
            className
          )}
          data-slot="accordion-trigger"
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <AccordionPrimitive.Panel
        ref={ref}
        className="overflow-hidden text-sm transition-all data-[ending-style]:h-0 data-[starting-style]:h-0"
        data-slot="accordion-content"
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      </AccordionPrimitive.Panel>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

// Aliases for COSS compatibility
const AccordionPanel = AccordionContent;

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionPanel,
};
