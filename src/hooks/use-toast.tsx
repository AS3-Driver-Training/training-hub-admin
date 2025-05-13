
import { toast as sonnerToast, ToastT, ToastOptions as SonnerToastOptions, ExternalToast } from 'sonner';
import { useState, useEffect } from 'react';

export interface ToastOptions extends SonnerToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const toast = (options: ToastOptions | string) => {
  // If the input is a string, use it as the message
  if (typeof options === 'string') {
    return sonnerToast(options);
  }

  // If there's a title provided, use it as the main message and description as the description
  const { title, description, ...restOptions } = options;
  
  if (title && description) {
    return sonnerToast(title, {
      description,
      ...restOptions
    });
  } else if (title) {
    return sonnerToast(title, restOptions);
  } else {
    // Fallback to empty toast if neither title nor description provided
    return sonnerToast('', restOptions);
  }
};

// Types for React Context
export type Toast = ToastT & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export type ToasterToast = Toast;

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterState = {
  toasts: ToasterToast[];
};

// Custom hook mimicking the shadcn/ui toast hook API
export function useToast() {
  const [state, setState] = useState<ToasterState>({
    toasts: [],
  });

  useEffect(() => {
    // Subscribe to toasts from sonner
    const unsubscribe = sonnerToast.subscribe((data) => {
      const { toast: sonnerToastData, type } = data;
      
      if (type === 'add') {
        setState((prev) => {
          const newToast: ToasterToast = {
            ...sonnerToastData as ToasterToast,
            id: (sonnerToastData.id as number).toString(),
          };
          return {
            ...prev,
            toasts: [newToast, ...prev.toasts].slice(0, TOAST_LIMIT),
          };
        });
      }
      
      if (type === 'dismiss') {
        setState((prev) => ({
          ...prev,
          toasts: prev.toasts.filter(
            (t) => t.id !== (sonnerToastData?.id as number)?.toString()
          ),
        }));
      }
      
      if (type === 'remove') {
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            toasts: prev.toasts.filter(
              (t) => t.id !== (sonnerToastData?.id as number)?.toString()
            ),
          }));
        }, TOAST_REMOVE_DELAY);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const customToast = {
    ...state,
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  };

  return customToast;
}
