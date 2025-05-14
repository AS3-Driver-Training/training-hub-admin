
// Import from sonner instead
import { toast } from "sonner";

// Create a simple hook to ensure consistent usage
export function useToast() {
  return { toast };
}

// Export toast for direct usage
export { toast };
