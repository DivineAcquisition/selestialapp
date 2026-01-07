"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { toggleVariants, type ToggleProps } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="toolbar"
    className={cn(
      "flex items-center gap-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
));
Toolbar.displayName = "Toolbar";

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  )
);
ToolbarButton.displayName = "ToolbarButton";

const ToolbarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    orientation="vertical"
    className={cn("mx-1 h-6", className)}
    {...props}
  />
));
ToolbarSeparator.displayName = "ToolbarSeparator";

const ToolbarToggleGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
ToolbarToggleGroup.displayName = "ToolbarToggleGroup";

const ToolbarToggleItem = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  )
);
ToolbarToggleItem.displayName = "ToolbarToggleItem";

const ToolbarLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      toggleVariants({ variant: "default", size: "default" }),
      className
    )}
    {...props}
  />
));
ToolbarLink.displayName = "ToolbarLink";

export {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarLink,
};
