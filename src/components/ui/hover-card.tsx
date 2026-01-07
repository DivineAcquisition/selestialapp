"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface HoverCardContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

const useHoverCard = () => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error("HoverCard components must be used within a HoverCard");
  }
  return context;
};

function HoverCard({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 200,
  closeDelay = 300,
}: {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement>(null);
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

      if (newOpen) {
        openTimeoutRef.current = setTimeout(() => {
          if (!isControlled) setInternalOpen(true);
          onOpenChange?.(true);
        }, openDelay);
      } else {
        closeTimeoutRef.current = setTimeout(() => {
          if (!isControlled) setInternalOpen(false);
          onOpenChange?.(false);
        }, closeDelay);
      }
    },
    [isControlled, onOpenChange, openDelay, closeDelay]
  );

  return (
    <HoverCardContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </HoverCardContext.Provider>
  );
}

const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const { onOpenChange, triggerRef } = useHoverCard();

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </div>
  );
});
HoverCardTrigger.displayName = "HoverCardTrigger";

const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
  }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const { open, onOpenChange } = useHoverCard();

  if (!open) return null;

  const alignStyles: Record<string, string> = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg outline-none",
        "animate-scale-in",
        "top-full mt-2",
        alignStyles[align],
        className
      )}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      {...props}
    />
  );
});
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
