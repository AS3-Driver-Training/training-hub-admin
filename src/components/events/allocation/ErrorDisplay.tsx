
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface ErrorDisplayProps {
  error: unknown;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  const navigate = useNavigate();
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      <Button onClick={() => navigate("/events")} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
      </Button>
    </div>
  );
}
