"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormContextValue {
  formId: string;
}

const FormContext = React.createContext<FormContextValue | null>(null);

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => {
    const formId = React.useId();

    return (
      <FormContext.Provider value={{ formId }}>
        <form
          ref={ref}
          className={cn("space-y-6", className)}
          {...props}
        />
      </FormContext.Provider>
    );
  }
);
Form.displayName = "Form";

interface FormFieldContextValue {
  name: string;
  id: string;
  error?: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const useFormField = () => {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within a FormField");
  }
  return context;
};

export interface FormFieldProps {
  name: string;
  children: React.ReactNode;
  error?: string;
}

function FormField({ name, children, error }: FormFieldProps) {
  const id = React.useId();

  return (
    <FormFieldContext.Provider value={{ name, id, error }}>
      <div className="space-y-2">{children}</div>
    </FormFieldContext.Provider>
  );
}

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { id, error } = useFormField();

  return (
    <Label
      ref={ref}
      htmlFor={id}
      className={cn(error && "text-destructive", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const { id, name, error } = useFormField();

  return (
    <div ref={ref} {...props}>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{
            id?: string;
            name?: string;
            "aria-invalid"?: boolean;
            "aria-describedby"?: string;
          }>, {
            id,
            name,
            "aria-invalid": !!error,
            "aria-describedby": error ? `${id}-error` : undefined,
          })
        : children}
    </div>
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { id } = useFormField();

  return (
    <p
      ref={ref}
      id={`${id}-description`}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { id, error } = useFormField();
  const message = error || children;

  if (!message) return null;

  return (
    <p
      ref={ref}
      id={`${id}-error`}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormItem.displayName = "FormItem";

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
