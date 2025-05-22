
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ReviewHeader() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Review all information before finalizing the course closure. You can go back to any section to make changes.
      </AlertDescription>
    </Alert>
  );
}
