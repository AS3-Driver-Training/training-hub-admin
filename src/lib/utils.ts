
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Status variant styles
export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
    case 'invited':
      return 'warning';
    case 'inactive':
    case 'suspended':
      return 'destructive';
    default:
      return 'secondary';
  }
};
