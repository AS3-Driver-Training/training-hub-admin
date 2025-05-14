
import { User } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-8 border rounded-md bg-slate-50">
      <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-base font-medium mb-1">No students found</h3>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search or add new students
      </p>
    </div>
  );
}
