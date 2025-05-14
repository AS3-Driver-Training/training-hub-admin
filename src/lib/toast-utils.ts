
import { toast } from "sonner";

/**
 * Standardized toast function to ensure consistent toast API usage across the application
 */
export function showToast({ 
  title, 
  description, 
  type = "default" 
}: { 
  title: string; 
  description?: string; 
  type?: "success" | "error" | "warning" | "info" | "default" 
}) {
  switch (type) {
    case "success":
      toast.success(title, { description });
      break;
    case "error":
      toast.error(title, { description });
      break;
    case "warning":
      toast.warning(title, { description });
      break;
    case "info":
      toast.info(title, { description });
      break;
    default:
      toast(title, { description });
  }
}
