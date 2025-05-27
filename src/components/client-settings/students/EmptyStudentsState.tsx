
import { Users } from "lucide-react";

interface EmptyStudentsStateProps {
  studentFilter: "active" | "inactive";
  searchQuery: string;
}

export function EmptyStudentsState({ studentFilter, searchQuery }: EmptyStudentsStateProps) {
  return (
    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        {searchQuery 
          ? `No ${studentFilter} students match your search`
          : `No ${studentFilter} students found`
        }
      </h3>
      <p className="text-sm text-muted-foreground">
        {searchQuery 
          ? "Try adjusting your search terms"
          : `This client doesn't have any ${studentFilter} students yet`
        }
      </p>
    </div>
  );
}
