
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, Edit, History } from "lucide-react";

interface StudentActionsProps {
  studentId: string;
}

export function StudentActions({ studentId }: StudentActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit Student
        </DropdownMenuItem>
        <DropdownMenuItem>
          <History className="mr-2 h-4 w-4" />
          Enrollment History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
