
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GoogleMapsErrorProps {
  scriptError: string | null;
}

export function GoogleMapsError({ scriptError }: GoogleMapsErrorProps) {
  if (!scriptError) return null;
  
  return (
    <div className={cn(
      "flex items-center text-sm text-destructive mt-1",
    )}>
      <AlertCircle className="h-4 w-4 mr-1" />
      <span>{scriptError}</span>
    </div>
  );
}
