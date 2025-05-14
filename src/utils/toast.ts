
import { toast as sonnerToast } from "sonner";

// Helper function to ensure proper structure of toast calls
export function toast(content: string | { title: string; description?: string; variant?: string }) {
  if (typeof content === 'string') {
    return sonnerToast(content);
  }
  
  const { title, description, variant } = content;
  // For destructive variant, use error toast
  if (variant === 'destructive') {
    return sonnerToast.error(title, { description });
  }
  
  return sonnerToast(title, { description });
}

// Re-export other toast methods for convenience
export const success = (content: string | { title: string; description?: string; variant?: string }) => {
  if (typeof content === 'string') {
    return sonnerToast.success(content);
  }
  
  const { title, description } = content;
  return sonnerToast.success(title, { description });
};

export const error = (content: string | { title: string; description?: string; variant?: string }) => {
  if (typeof content === 'string') {
    return sonnerToast.error(content);
  }
  
  const { title, description } = content;
  return sonnerToast.error(title, { description });
};

export const info = (content: string | { title: string; description?: string; variant?: string }) => {
  if (typeof content === 'string') {
    return sonnerToast.info(content);
  }
  
  const { title, description } = content;
  return sonnerToast.info(title, { description });
};

export const warning = (content: string | { title: string; description?: string; variant?: string }) => {
  if (typeof content === 'string') {
    return sonnerToast.warning(content);
  }
  
  const { title, description } = content;
  return sonnerToast.warning(title, { description });
};
