"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenubarContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null);

const useMenubar = () => {
  const context = React.useContext(MenubarContext);
  if (!context) {
    throw new Error("Menubar components must be used within a Menubar");
  }
  return context;
};

const Menubar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [value, setValue] = React.useState("");

  return (
    <MenubarContext.Provider value={{ value, onValueChange: setValue }}>
      <div
        ref={ref}
        className={cn(
          "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </MenubarContext.Provider>
  );
});
Menubar.displayName = "Menubar";

interface MenubarMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
}

const MenubarMenuContext = React.createContext<MenubarMenuContextValue | null>(null);

const useMenubarMenu = () => {
  const context = React.useContext(MenubarMenuContext);
  if (!context) {
    throw new Error("MenubarMenu components must be used within a MenubarMenu");
  }
  return context;
};

interface MenubarMenuProps {
  children: React.ReactNode;
  value?: string;
}

function MenubarMenu({ children, value = "" }: MenubarMenuProps) {
  const { value: menubarValue, onValueChange } = useMenubar();
  const open = menubarValue === value;

  const handleOpenChange = (newOpen: boolean) => {
    onValueChange(newOpen ? value : "");
  };

  return (
    <MenubarMenuContext.Provider value={{ open, onOpenChange: handleOpenChange, value }}>
      <div className="relative">{children}</div>
    </MenubarMenuContext.Provider>
  );
}

const MenubarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { open, onOpenChange } = useMenubarMenu();

  return (
    <button
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        open && "bg-accent text-accent-foreground",
        className
      )}
      data-state={open ? "open" : "closed"}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(!open);
      }}
      {...props}
    />
  );
});
MenubarTrigger.displayName = "MenubarTrigger";

function MenubarPortal({ children }: { children: React.ReactNode }) {
  const { open } = useMenubarMenu();
  if (!open) return null;
  return <>{children}</>;
}

const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
  }
>(({ className, align = "start", sideOffset = 8, ...props }, ref) => {
  const { onOpenChange } = useMenubarMenu();

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menubar-content]") && !target.closest("[data-menubar-trigger]")) {
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
    <MenubarPortal>
      <div
        ref={ref}
        data-menubar-content
        className={cn(
          "absolute z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-scale-in",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "end" && "right-0",
          className
        )}
        style={{ top: `calc(100% + ${sideOffset}px)` }}
        {...props}
      />
    </MenubarPortal>
  );
});
MenubarContent.displayName = "MenubarContent";

const MenubarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; disabled?: boolean }
>(({ className, inset, disabled, onClick, ...props }, ref) => {
  const { onOpenChange } = useMenubarMenu();

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
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
MenubarItem.displayName = "MenubarItem";

const MenubarCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
>(({ className, children, checked, onCheckedChange, ...props }, ref) => {
  const { onOpenChange } = useMenubarMenu();

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
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
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

const MenubarRadioItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; checked?: boolean }
>(({ className, children, checked, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
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
MenubarRadioItem.displayName = "MenubarRadioItem";

const MenubarLabel = React.forwardRef<
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
MenubarLabel.displayName = "MenubarLabel";

const MenubarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
MenubarSeparator.displayName = "MenubarSeparator";

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
MenubarShortcut.displayName = "MenubarShortcut";

function MenubarGroup({ children }: { children: React.ReactNode }) {
  return <div role="group">{children}</div>;
}

function MenubarRadioGroup({ children }: { children: React.ReactNode }) {
  return <div role="radiogroup">{children}</div>;
}

function MenubarSub({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

const MenubarSubTrigger = React.forwardRef<
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
MenubarSubTrigger.displayName = "MenubarSubTrigger";

const MenubarSubContent = React.forwardRef<
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
MenubarSubContent.displayName = "MenubarSubContent";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
