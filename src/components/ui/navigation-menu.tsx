"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn(
        "relative z-10 flex max-w-max flex-1 items-center justify-center",
        className
      )}
      data-slot="navigation-menu"
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
);
NavigationMenu.displayName = "NavigationMenu";

interface NavigationMenuListProps {
  children?: React.ReactNode;
  className?: string;
}

function NavigationMenuList({ className, children }: NavigationMenuListProps) {
  return (
    <NavigationMenuPrimitive.List
      className={cn(
        "group flex flex-1 list-none items-center justify-center space-x-1",
        className
      )}
      data-slot="navigation-menu-list"
    >
      {children}
    </NavigationMenuPrimitive.List>
  );
}

function NavigationMenuItem(props: { children?: React.ReactNode } & React.HTMLAttributes<HTMLLIElement>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...props} />;
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[popup-open]:bg-accent/50"
);

interface NavigationMenuTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      data-slot="navigation-menu-trigger"
      {...props}
    >
      {children}{" "}
      <ChevronDown
        className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[popup-open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function NavigationMenuContent({ className, children, ...props }: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "left-0 top-0 w-full md:absolute md:w-auto transition-[opacity,transform] data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      data-slot="navigation-menu-content"
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Content>
  );
}

interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
  active?: boolean;
}

function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(navigationMenuTriggerStyle(), className)}
      data-slot="navigation-menu-link"
      {...props}
    />
  );
}

interface NavigationMenuViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function NavigationMenuViewport({ className, ...props }: NavigationMenuViewportProps) {
  return (
    <div className={cn("absolute left-0 top-full flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        className={cn(
          "origin-top-center relative mt-1.5 h-[var(--navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg transition-[opacity,transform] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95 md:w-[var(--navigation-menu-viewport-width)]",
          className
        )}
        data-slot="navigation-menu-viewport"
        {...props}
      />
    </div>
  );
}

interface NavigationMenuIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

// Note: Base UI doesn't have an Indicator component, using a div fallback
function NavigationMenuIndicator({ className, children, ...props }: NavigationMenuIndicatorProps) {
  return (
    <div
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      data-slot="navigation-menu-indicator"
      {...props}
    >
      {children || <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />}
    </div>
  );
}

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
