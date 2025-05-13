
"use client";

import { useState, type ReactNode } from "react";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

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

// Export the toast function from sonner directly
// This is a proper function with call signatures that can be invoked
export const toast = sonnerToast;
export { Toaster };
