"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AutocompleteContextValue {
  search: string;
  setSearch: (search: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: AutocompleteOption[];
  filteredOptions: AutocompleteOption[];
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
}

const AutocompleteContext = React.createContext<AutocompleteContextValue | null>(null);

const useAutocomplete = () => {
  const context = React.useContext(AutocompleteContext);
  if (!context) {
    throw new Error("Autocomplete components must be used within an Autocomplete");
  }
  return context;
};

export interface AutocompleteProps {
  children: React.ReactNode;
  options?: AutocompleteOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  autoHighlight?: boolean | "always";
  keepHighlight?: boolean;
}

function Autocomplete({
  children,
  options = [],
  value: controlledValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
}: AutocompleteProps) {
  const [search, setSearch] = React.useState("");
  const [internalValue, setInternalValue] = React.useState("");
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  const value = controlledValue ?? internalValue;
  const open = controlledOpen ?? internalOpen;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AutocompleteContext.Provider
      value={{
        search,
        setSearch,
        value,
        onValueChange: handleValueChange,
        open,
        onOpenChange: handleOpenChange,
        options,
        filteredOptions,
        highlightedIndex,
        setHighlightedIndex,
      }}
    >
      <div className="relative">{children}</div>
    </AutocompleteContext.Provider>
  );
}

export interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startAddon?: React.ReactNode;
}

const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ className, startAddon, ...props }, ref) => {
    const { search, setSearch, onOpenChange } = useAutocomplete();

    return (
      <div className={cn("relative flex items-center", className)}>
        {startAddon && (
          <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
            {startAddon}
          </div>
        )}
        <input
          ref={ref}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onOpenChange(true);
          }}
          onFocus={() => onOpenChange(true)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            startAddon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
AutocompleteInput.displayName = "AutocompleteInput";

const AutocompleteList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useAutocomplete();

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
AutocompleteList.displayName = "AutocompleteList";

const AutocompleteEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { filteredOptions } = useAutocomplete();

  if (filteredOptions.length > 0) return null;

  return (
    <div
      ref={ref}
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  );
});
AutocompleteEmpty.displayName = "AutocompleteEmpty";

const AutocompleteGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("overflow-hidden p-1", className)} {...props} />
));
AutocompleteGroup.displayName = "AutocompleteGroup";

const AutocompleteGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
    {...props}
  />
));
AutocompleteGroupLabel.displayName = "AutocompleteGroupLabel";

export interface AutocompleteItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const AutocompleteItem = React.forwardRef<HTMLDivElement, AutocompleteItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange, onOpenChange, setSearch } = useAutocomplete();
    const isSelected = selectedValue === value;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={() => {
          if (disabled) return;
          onValueChange(value);
          setSearch("");
          onOpenChange(false);
        }}
        {...props}
      >
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
        {children}
      </div>
    );
  }
);
AutocompleteItem.displayName = "AutocompleteItem";

const AutocompleteSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
AutocompleteSeparator.displayName = "AutocompleteSeparator";

function AutocompleteCollection({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export {
  Autocomplete,
  AutocompleteInput,
  AutocompleteList,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteItem,
  AutocompleteSeparator,
  AutocompleteCollection,
};
