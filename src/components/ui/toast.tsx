"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// Toast Context for managing toasts
interface ToastContextValue {
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, "id">) => void;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<ToasterToast>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToastContext() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  duration?: number;
}

export function ToastProvider({ children, duration = 5000 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const addToast = React.useCallback((toast: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id, open: true }]);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, open: false } : t))
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, duration);
    }
  }, [duration]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, open: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const updateToast = React.useCallback((id: string, toast: Partial<ToasterToast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// Toast Viewport
interface ToastViewportProps {
  className?: string;
}

export function ToastViewport({ className }: ToastViewportProps) {
  const { toasts } = useToastContext();

  return (
    <div
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      data-slot="toast-viewport"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}

// Toast variants
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Toast types
export interface ToasterToast extends VariantProps<typeof toastVariants> {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// Toast component
function Toast({
  id,
  title,
  description,
  action,
  variant,
  open = true,
  className,
}: ToasterToast) {
  const { removeToast } = useToastContext();

  return (
    <div
      className={cn(
        toastVariants({ variant }),
        open
          ? "animate-in slide-in-from-bottom-full sm:slide-in-from-right-full"
          : "animate-out fade-out-80 slide-out-to-right-full",
        className
      )}
      data-slot="toast"
      data-state={open ? "open" : "closed"}
    >
      <div className="grid gap-1">
        {title && (
          <div className="text-sm font-semibold" data-slot="toast-title">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90" data-slot="toast-description">
            {description}
          </div>
        )}
      </div>
      {action}
      <button
        onClick={() => removeToast(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
        data-slot="toast-close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast Action
interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText?: string;
}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
        className
      )}
      data-slot="toast-action"
      {...props}
    />
  )
);
ToastAction.displayName = "ToastAction";

// Toast Close
const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { toastId?: string }
>(({ className, toastId, ...props }, ref) => {
  const { removeToast } = useToastContext();

  return (
    <button
      ref={ref}
      onClick={() => toastId && removeToast(toastId)}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
        className
      )}
      data-slot="toast-close"
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
});
ToastClose.displayName = "ToastClose";

// Toast Title
const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    data-slot="toast-title"
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

// Toast Description
const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    data-slot="toast-description"
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

type ToastProps = ToasterToast;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
