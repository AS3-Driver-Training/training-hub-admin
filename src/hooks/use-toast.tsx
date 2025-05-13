
"use client";

import { useState, type ReactNode } from "react";
import { Toaster as Sonner, toast as sonnerToast, type ExternalToast } from "sonner";

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

// Create a properly typed wrapper for sonner toast that accepts our application's expected interface
interface CustomToastOptions {
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "destructive" | undefined;
  [key: string]: any; // Allow other properties that sonner might accept
}

// This is our custom toast function that matches the API used throughout the application
const customToast = (options: CustomToastOptions) => {
  // Convert our app's toast format to sonner's format
  // Use title as the main message and pass description and other properties
  return sonnerToast(options.title || "", {
    description: options.description,
    action: options.action,
    // Pass any other properties
    ...Object.entries(options)
      .filter(([key]) => !['title'].includes(key))
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
  });
};

// Add the same methods that sonner toast has
Object.keys(sonnerToast).forEach(key => {
  if (typeof sonnerToast[key as keyof typeof sonnerToast] === 'function') {
    (customToast as any)[key] = sonnerToast[key as keyof typeof sonnerToast];
  }
});

// Export our custom toast function that accepts the format used in our app
export const toast = customToast as typeof sonnerToast & {
  (options: CustomToastOptions): string | number;
};

export { Toaster };
