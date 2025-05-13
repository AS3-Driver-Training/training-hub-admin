
import * as React from 'react';
import { toast as sonnerToast, ToastT, ExternalToast } from 'sonner';

export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;

export interface ToastOptions extends ExternalToast {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

// Export sonner's toast function with our custom interface
export const toast = (options: ToastOptions | string) => {
  // If the input is a string, use it as the message
  if (typeof options === 'string') {
    return sonnerToast(options);
  }

  // Extract our custom properties
  const { title, description, variant, ...restOptions } = options;
  
  // Map our variant to sonner styles
  let sonnerOptions = { ...restOptions };
  if (variant === "destructive") {
    sonnerOptions = {
      ...sonnerOptions,
      style: { 
        backgroundColor: 'rgb(var(--destructive))',
        color: 'rgb(var(--destructive-foreground))',
        border: '1px solid rgb(var(--destructive))',
        ...sonnerOptions.style
      }
    };
  }
  
  // Use title as main message and description as sonner's description
  if (title && description) {
    return sonnerToast(title, {
      description,
      ...sonnerOptions
    });
  } else if (title) {
    return sonnerToast(title, sonnerOptions);
  } else {
    // Fallback to empty toast if neither title nor description provided
    return sonnerToast('', sonnerOptions);
  }
};

// Types for React Context
export type Toast = ToastT & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export type ToasterToast = Toast;

// Simplified useToast hook that doesn't try to subscribe to sonner events
export function useToast() {
  const dismiss = (toastId?: string) => {
    sonnerToast.dismiss(toastId);
  };

  return {
    toast,
    dismiss,
  };
}
