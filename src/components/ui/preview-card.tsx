"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PreviewCardContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PreviewCardContext = React.createContext<PreviewCardContextValue | null>(null);

const usePreviewCard = () => {
  const context = React.useContext(PreviewCardContext);
  if (!context) {
    throw new Error("PreviewCard components must be used within a PreviewCard");
  }
  return context;
};

export interface PreviewCardProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
}

function PreviewCard({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
}: PreviewCardProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleOpenChange = (newOpen: boolean) => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    const delay = newOpen ? openDelay : closeDelay;
    const timeoutRef = newOpen ? openTimeoutRef : closeTimeoutRef;

    timeoutRef.current = setTimeout(() => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, delay);
  };

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return (
    <PreviewCardContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <div className="relative inline-block">{children}</div>
    </PreviewCardContext.Provider>
  );
}

export interface PreviewCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const PreviewCardTrigger = React.forwardRef<HTMLDivElement, PreviewCardTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { onOpenChange } = usePreviewCard();

    const handleMouseEnter = () => onOpenChange(true);
    const handleMouseLeave = () => onOpenChange(false);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
      }>, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      });
    }

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PreviewCardTrigger.displayName = "PreviewCardTrigger";

const PreviewCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
  }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const { open, onOpenChange } = usePreviewCard();

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "animate-scale-in",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "end" && "right-0",
        className
      )}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      {...props}
    />
  );
});
PreviewCardContent.displayName = "PreviewCardContent";

export { PreviewCard, PreviewCardTrigger, PreviewCardContent };
