
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface GoogleMapsErrorProps {
  scriptError: string | null;
}

export function GoogleMapsError({ scriptError }: GoogleMapsErrorProps) {
  if (!scriptError) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Google Maps Configuration Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{scriptError}</p>
        <p className="text-xs mt-1">
          To fix this issue, please check the following in your Google Cloud Console:
        </p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>Make sure billing is enabled for your Google Cloud project</li>
          <li>Enable the Places API in the API Library</li>
          <li>Ensure your API key has the proper permissions and no restrictions that would block this domain</li>
          <li>Check that you have sufficient quota and haven't exceeded API limits</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
