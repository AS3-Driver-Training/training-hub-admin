
// Import from our utils instead
import * as toastUtils from "@/utils/toast";

// Create a simple hook to ensure consistent usage
export function useToast() {
  return { toast: toastUtils.toast };
}

// Export toast for direct usage
export const toast = toastUtils.toast;
export const success = toastUtils.success;
export const error = toastUtils.error;
export const info = toastUtils.info;
export const warning = toastUtils.warning;
