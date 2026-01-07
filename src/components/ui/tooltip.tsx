"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({ 
  children,
  delayDuration: _delayDuration,
}: { 
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return <>{children}</>;
}

interface TooltipProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  children?: React.ReactNode;
}

function Tooltip({
  delayDuration: _delayDuration = 200,
  onOpenChange,
  ...props
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root 
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
      {...props}
    />
  );
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children?: React.ReactNode;
}

function TooltipTrigger({ asChild, children, ...props }: TooltipTriggerProps) {
  // Convert asChild pattern to render prop for compatibility
  if (asChild && React.isValidElement(children)) {
    return (
      <TooltipPrimitive.Trigger 
        data-slot="tooltip-trigger" 
        render={children}
        {...props}
      />
    );
  }
  
  return (
    <TooltipPrimitive.Trigger 
      data-slot="tooltip-trigger" 
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}

interface TooltipPopupProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  hidden?: boolean;
  children?: React.ReactNode;
}

function TooltipPopup({
  className,
  sideOffset = 4,
  children,
  side = "top",
  align = "center",
  hidden,
  ...props
}: TooltipPopupProps) {
  if (hidden) {
    return null;
  }
  
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side} align={align}>
        <TooltipPrimitive.Popup
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md transition-[opacity,transform] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95",
            className
          )}
          data-slot="tooltip-popup"
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipPopup as TooltipContent,
  TooltipProvider,
};
