
import { Loader2 } from "lucide-react";

export interface LoadingDisplayProps {
  text: string;
}

export function LoadingDisplay({ text }: LoadingDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  );
}
