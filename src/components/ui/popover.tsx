"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

interface PopoverTriggerProps extends Omit<PopoverPrimitive.Trigger.Props, 'render'> {
  asChild?: boolean;
  render?: PopoverPrimitive.Trigger.Props['render'];
}

function PopoverTrigger({ asChild, children, render, ...props }: PopoverTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return (
      <PopoverPrimitive.Trigger data-slot="popover-trigger" render={children} {...props} />
    );
  }
  return (
    <PopoverPrimitive.Trigger data-slot="popover-trigger" render={render} {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  );
}

function PopoverAnchor(props: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  // Note: Base UI Popover doesn't have a separate Anchor - use regular div for anchoring
  return <div data-slot="popover-anchor" {...props} />;
}

function PopoverPopup({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner align={align} sideOffset={sideOffset}>
        <PopoverPrimitive.Popup
          className={cn(
            "z-50 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-[opacity,transform] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95",
            className
          )}
          data-slot="popover-popup"
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverPopup as PopoverContent,
  PopoverAnchor,
};
