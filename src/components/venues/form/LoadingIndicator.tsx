
import { Loader2 } from "lucide-react";

export interface LoadingIndicatorProps {
  isLoading: boolean;
}

export function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null;
  
  return (
    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  );
}
