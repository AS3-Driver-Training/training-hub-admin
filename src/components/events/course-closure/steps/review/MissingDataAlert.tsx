
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MissingDataAlert() {
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Course instance data is missing. Please go back to the previous page and try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}
