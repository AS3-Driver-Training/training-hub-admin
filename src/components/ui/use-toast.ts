
// Import from sonner instead
import { toast as sonnerToast } from "sonner";

// Create a simple hook to ensure consistent usage
export function useToast() {
  return { toast: sonnerToast };
}

// Export toast for direct usage
export const toast = sonnerToast;
