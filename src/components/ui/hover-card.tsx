"use client";

import * as React from "react";
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";

import { cn } from "@/lib/utils";

const HoverCard = PreviewCardPrimitive.Root;

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children?: React.ReactNode;
}

function HoverCardTrigger({ asChild, children, ...props }: HoverCardTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return (
      <PreviewCardPrimitive.Trigger
        data-slot="hover-card-trigger"
        render={children}
        {...props}
      />
    );
  }
  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props}>
      {children}
    </PreviewCardPrimitive.Trigger>
  );
}

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = "center", sideOffset = 4, side = "bottom", ...props }, ref) => (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner align={align} sideOffset={sideOffset} side={side}>
        <PreviewCardPrimitive.Popup
          ref={ref}
          className={cn(
            "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-[opacity,transform] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95",
            className
          )}
          data-slot="hover-card-content"
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
);
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
