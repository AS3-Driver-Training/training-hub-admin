
"use client";

import { useState, useEffect } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner {...props} />;
};

interface ToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | undefined;
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

// For compatibility with Sonner
import { toast } from "sonner";
export { toast, Toaster };
