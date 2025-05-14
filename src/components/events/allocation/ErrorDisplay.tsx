
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

export interface ErrorDisplayProps {
  title: string;
  error: any;
  onBack?: () => void;
}

export function ErrorDisplay({ title, error, onBack }: ErrorDisplayProps) {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </AlertDescription>
      </Alert>
      
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          Go Back
        </Button>
      )}
    </div>
  );
}
