"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

const useMenu = () => {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error("Menu components must be used within a Menu");
  }
  return context;
};

export interface MenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Menu({ children, open, defaultOpen = false, onOpenChange }: MenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <MenuContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <div className="relative inline-block">{children}</div>
    </MenuContext.Provider>
  );
}

export interface MenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const { open, onOpenChange } = useMenu();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
        onClick: () => onOpenChange(!open),
      });
    }

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
MenuTrigger.displayName = "MenuTrigger";

function MenuPortal({ children }: { children: React.ReactNode }) {
  const { open } = useMenu();
  if (!open) return null;
  return <>{children}</>;
}

const MenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sideOffset?: number;
    align?: "start" | "center" | "end";
  }
>(({ className, sideOffset = 4, align = "center", ...props }, ref) => {
  const { onOpenChange } = useMenu();

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-content]") && !target.closest("[data-menu-trigger]")) {
        onOpenChange(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onOpenChange]);

  return (
    <MenuPortal>
      <div
        ref={ref}
        data-menu-content
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-scale-in",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "end" && "right-0",
          className
        )}
        style={{ top: `calc(100% + ${sideOffset}px)` }}
        {...props}
      />
    </MenuPortal>
  );
});
MenuContent.displayName = "MenuContent";

const MenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; disabled?: boolean }
>(({ className, inset, disabled, onClick, ...props }, ref) => {
  const { onOpenChange } = useMenu();

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        inset && "pl-8",
        className
      )}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
        onOpenChange(false);
      }}
      {...props}
    />
  );
});
MenuItem.displayName = "MenuItem";

const MenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
>(({ className, children, checked, onCheckedChange, ...props }, ref) => {
  const { onOpenChange } = useMenu();

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={() => {
        onCheckedChange?.(!checked);
        onOpenChange(false);
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});
MenuCheckboxItem.displayName = "MenuCheckboxItem";

const MenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; checked?: boolean }
>(({ className, children, checked, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:bg-accent focus:text-accent-foreground",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Circle className="h-2 w-2 fill-current" />}
    </span>
    {children}
  </div>
));
MenuRadioItem.displayName = "MenuRadioItem";

const MenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
MenuLabel.displayName = "MenuLabel";

const MenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
MenuSeparator.displayName = "MenuSeparator";

function MenuGroup({ children }: { children: React.ReactNode }) {
  return <div role="group">{children}</div>;
}

function MenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <div role="radiogroup">{children}</div>;
}

function MenuSub({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

const MenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      "hover:bg-accent focus:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
));
MenuSubTrigger.displayName = "MenuSubTrigger";

const MenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
      className
    )}
    {...props}
  />
));
MenuSubContent.displayName = "MenuSubContent";

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuLabel,
  MenuSeparator,
  MenuGroup,
  MenuPortal,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuRadioGroup,
};
