"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a TooltipProvider");
  }
  return context;
};

function TooltipProvider({ children, delayDuration }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

export interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

function Tooltip({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const triggerRef = React.useRef<HTMLElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <TooltipContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { onOpenChange, triggerRef } = useTooltip();

    const handleMouseEnter = () => onOpenChange(true);
    const handleMouseLeave = () => onOpenChange(false);
    const handleFocus = () => onOpenChange(true);
    const handleBlur = () => onOpenChange(false);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
        onFocus?: () => void;
        onBlur?: () => void;
        ref?: React.Ref<HTMLElement>;
      }>, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ref: triggerRef,
      });
    }

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    sideOffset?: number;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    hidden?: boolean;
  }
>(({ className, sideOffset = 4, side = "top", align = "center", hidden, ...props }, ref) => {
  const { open } = useTooltip();

  if (!open || hidden) return null;

  const sideStyles = {
    top: { bottom: `calc(100% + ${sideOffset}px)` },
    bottom: { top: `calc(100% + ${sideOffset}px)` },
    left: { right: `calc(100% + ${sideOffset}px)` },
    right: { left: `calc(100% + ${sideOffset}px)` },
  };

  const alignStyles = {
    start: side === "top" || side === "bottom" ? "left-0" : "top-0",
    center: side === "top" || side === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
    end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        "animate-fade-in",
        alignStyles[align],
        className
      )}
      style={sideStyles[side]}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
