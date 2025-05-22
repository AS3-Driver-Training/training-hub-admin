
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface FileValidationAlertProps {
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function FileValidationAlert({ onJumpToStep }: FileValidationAlertProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Course data file is required. Please go back to the Basic Information step to upload it.
        </AlertDescription>
      </Alert>
      <Button onClick={() => onJumpToStep('basic')}>
        Go to Basic Information
      </Button>
    </div>
  );
}
