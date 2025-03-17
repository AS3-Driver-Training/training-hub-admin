
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GoogleMapsErrorProps {
  errorMessage: string;
}

export function GoogleMapsError({ errorMessage }: GoogleMapsErrorProps) {
  return (
    <div className={cn(
      "flex items-center text-sm text-destructive mt-1",
    )}>
      <AlertCircle className="h-4 w-4 mr-1" />
      <span>{errorMessage}</span>
    </div>
  );
}
