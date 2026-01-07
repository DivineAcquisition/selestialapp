"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Field Context for managing field state
interface FieldContextValue {
  name: string;
  id: string;
  error?: string;
  setError: (error: string | undefined) => void;
  touched: boolean;
  setTouched: (touched: boolean) => void;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

const useField = () => {
  const context = React.useContext(FieldContext);
  if (!context) {
    throw new Error("useField must be used within a Field component");
  }
  return context;
};

// Field component - wrapper for form fields
interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  children: React.ReactNode;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ name, children, className, ...props }, ref) => {
    const id = React.useId();
    const [error, setError] = React.useState<string | undefined>();
    const [touched, setTouched] = React.useState(false);

    return (
      <FieldContext.Provider value={{ name, id, error, setError, touched, setTouched }}>
        <div
          ref={ref}
          className={cn("space-y-2", className)}
          {...props}
        >
          {children}
        </div>
      </FieldContext.Provider>
    );
  }
);
Field.displayName = "Field";

// FieldLabel component
interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ children, className, required, ...props }, ref) => {
    const { id, error } = useField();

    return (
      <label
        ref={ref}
        htmlFor={id}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    );
  }
);
FieldLabel.displayName = "FieldLabel";

// FieldDescription component
interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-xs text-muted-foreground", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
FieldDescription.displayName = "FieldDescription";

// FieldError component - shows validation error
interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  show?: boolean;
}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ children, className, show, ...props }, ref) => {
    const { error, touched } = useField();
    
    // Show error if explicitly set, or if field has been touched and has error
    const shouldShow = show !== undefined ? show : (touched && error);
    
    if (!shouldShow && !error) {
      return null;
    }

    return (
      <p
        ref={ref}
        className={cn(
          "text-xs font-medium text-destructive flex items-center gap-1.5",
          !shouldShow && "hidden",
          className
        )}
        role="alert"
        {...props}
      >
        <svg
          className="h-3.5 w-3.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {error || children}
      </p>
    );
  }
);
FieldError.displayName = "FieldError";

// FieldInput wrapper - automatically connects input to field context
interface FieldInputProps {
  children: React.ReactElement<{
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }>;
  validate?: (value: string) => string | undefined;
}

const FieldInput = ({ children, validate }: FieldInputProps) => {
  const { id, name, setError, setTouched } = useField();

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (validate) {
      const error = validate(e.target.value);
      setError(error);
    }
    // Call original onBlur if exists
    const childProps = children.props as { onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void };
    if (childProps.onBlur) {
      childProps.onBlur(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validate) {
      const error = validate(e.target.value);
      setError(error);
    }
    // Call original onChange if exists
    const childProps = children.props as { onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void };
    if (childProps.onChange) {
      childProps.onChange(e);
    }
  };

  return React.cloneElement(children, {
    id,
    name,
    onBlur: handleBlur,
    onChange: handleChange,
  } as React.HTMLAttributes<HTMLInputElement>);
};
FieldInput.displayName = "FieldInput";

// Enhanced Field Group for horizontal layouts
interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 sm:flex-row sm:gap-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FieldGroup.displayName = "FieldGroup";

// Fieldset component for grouping related fields
interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
}

const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ children, legend, className, ...props }, ref) => {
    return (
      <fieldset
        ref={ref}
        className={cn("space-y-4 rounded-xl border border-gray-200 p-4", className)}
        {...props}
      >
        {legend && (
          <legend className="px-2 text-sm font-semibold text-gray-900">
            {legend}
          </legend>
        )}
        {children}
      </fieldset>
    );
  }
);
Fieldset.displayName = "Fieldset";

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldInput,
  FieldGroup,
  Fieldset,
  useField,
};
