"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldContextValue {
  name?: string;
  error?: string;
}

const FieldContext = React.createContext<FieldContextValue>({});

export const useField = () => React.useContext(FieldContext);

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  error?: string;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, name, error, children, ...props }, ref) => (
    <FieldContext.Provider value={{ name, error }}>
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  )
);
Field.displayName = "Field";

const FieldGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    />
  )
);
FieldGroup.displayName = "FieldGroup";

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    const { name } = useField();
    return (
      <label
        ref={ref}
        htmlFor={name}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
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

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
FieldDescription.displayName = "FieldDescription";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  show?: boolean;
}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, children, show = true, ...props }, ref) => {
    const { error } = useField();
    const errorMessage = children || error;
    
    if (!errorMessage || !show) return null;
    
    return (
      <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {errorMessage}
      </p>
    );
  }
);
FieldError.displayName = "FieldError";

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError };
