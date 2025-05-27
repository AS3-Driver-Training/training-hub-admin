
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function ClientStudentsHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Client Students
      </CardTitle>
    </CardHeader>
  );
}
