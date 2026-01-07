"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface SelectItemData {
  value: string;
  label: string;
}

interface SelectContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  registerItem: (item: SelectItemData) => void;
  unregisterItem: (value: string) => void;
  getItemLabel: (value: string) => string | undefined;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
};

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

function Select({
  children,
  value,
  defaultValue = "",
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemsRef = React.useRef<Map<string, string>>(new Map());

  const isValueControlled = value !== undefined;
  const isOpenControlled = open !== undefined;

  const currentValue = isValueControlled ? value : internalValue;
  const currentOpen = isOpenControlled ? open : internalOpen;

  const registerItem = React.useCallback((item: SelectItemData) => {
    itemsRef.current.set(item.value, item.label);
  }, []);

  const unregisterItem = React.useCallback((value: string) => {
    itemsRef.current.delete(value);
  }, []);

  const getItemLabel = React.useCallback((value: string) => {
    return itemsRef.current.get(value);
  }, []);

  const handleValueChange = (newValue: string) => {
    if (!isValueControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    handleOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isOpenControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <SelectContext.Provider
      value={{
        open: currentOpen,
        onOpenChange: handleOpenChange,
        value: currentValue,
        onValueChange: handleValueChange,
        triggerRef,
        registerItem,
        unregisterItem,
        getItemLabel,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div className="py-1">{children}</div>;
}

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { value, getItemLabel } = useSelect();
  const [displayValue, setDisplayValue] = React.useState<string>("");

  // Update display value when value or items change
  React.useEffect(() => {
    if (value) {
      const label = getItemLabel(value);
      if (label) {
        setDisplayValue(label);
      }
    } else {
      setDisplayValue("");
    }
  }, [value, getItemLabel]);

  // Poll for label if not immediately available (for async-loaded items)
  React.useEffect(() => {
    if (value && !displayValue) {
      const interval = setInterval(() => {
        const label = getItemLabel(value);
        if (label) {
          setDisplayValue(label);
          clearInterval(interval);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [value, displayValue, getItemLabel]);

  return (
    <span ref={ref} className={cn("block truncate", !displayValue && "text-gray-400", className)} {...props}>
      {displayValue || placeholder || "Select..."}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = useSelect();

  // Combine refs
  const combinedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      // Update triggerRef
      if (triggerRef && 'current' in triggerRef) {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
      // Update forwarded ref
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    },
    [triggerRef, ref]
  );

  return (
    <button
      ref={combinedRef}
      type="button"
      data-select-trigger
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
        "transition-all duration-200",
        "hover:border-gray-300",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        "[&>span]:line-clamp-1",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(!open);
      }}
      aria-expanded={open}
      aria-haspopup="listbox"
      {...props}
    >
      {children}
      <Icon name="chevronDown" size="sm" className={cn("text-gray-400 transition-transform duration-200 shrink-0 ml-2", open && "rotate-180")} />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { position?: "popper" | "item-aligned" }
>(({ className, children, position = "popper", ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = useSelect();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const content = contentRef.current;
      const trigger = triggerRef.current;
      
      if (content && !content.contains(target) && trigger && !trigger.contains(target)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    // Small delay to prevent immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);
    document.addEventListener("keydown", handleEscape);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange, triggerRef]);

  // Always render to register items, but hide when closed
  return (
    <div
      ref={(node) => {
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      data-select-content
      className={cn(
        "absolute z-50 max-h-60 min-w-[8rem] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg",
        "transition-all duration-150",
        position === "popper" && "w-full top-full mt-1",
        !open && "invisible opacity-0 pointer-events-none h-0 overflow-hidden border-0",
        open && "visible opacity-100",
        className
      )}
      role="listbox"
      {...props}
    >
      <div className="w-full p-1">{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-xs font-medium text-gray-500", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

// Helper function to extract text content from React children
function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(getTextContent).join('');
  }
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    if (props.children) {
      return getTextContent(props.children);
    }
  }
  return '';
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ className, children, value, disabled, ...props }, ref) => {
  const { value: selectedValue, onValueChange, registerItem, unregisterItem } = useSelect();
  const isSelected = selectedValue === value;

  // Register this item with its label on mount
  React.useEffect(() => {
    const label = getTextContent(children);
    registerItem({ value, label });
    
    return () => {
      unregisterItem(value);
    };
  }, [value, children, registerItem, unregisterItem]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onValueChange(value);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm text-gray-700 outline-none",
        "hover:bg-gray-50",
        isSelected && "bg-primary/5 text-primary font-medium",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {isSelected && <Icon name="check" size="sm" className="text-primary" />}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-100", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

function SelectScrollUpButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return null;
}

function SelectScrollDownButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return null;
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
