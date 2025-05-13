
"use client";

import { useState, type ReactNode } from "react";
import { Toaster as Sonner, toast as sonnerToast, type ToastT } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner {...props} />;
};

interface ToastOptions {
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "destructive" | undefined;
  id?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { ...options, id }]);
    return id;
  };

  toast.success = (message: string, options?: Omit<ToastOptions, "title">) => {
    return toast({ title: message, ...options });
  };

  toast.error = (message: string, options?: Omit<ToastOptions, "title">) => {
    return toast({ title: message, variant: "destructive", ...options });
  };

  return { toast, toasts };
}

// Re-export properly typed toast function from sonner
// This ensures the type includes all the properties being used in the components
export const toast: ToastT = sonnerToast;
export { Toaster };
