
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Calendar } from "lucide-react";
import { StudentActions } from "./StudentActions";

interface ClientStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  employee_number: string | null;
  phone: string | null;
  total_enrollments: number;
  last_course_date: string | null;
  teams: {
    name: string;
    groups: {
      name: string;
    };
  };
}

interface StudentTableRowProps {
  student: ClientStudent;
}

export function StudentTableRow({ student }: StudentTableRowProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatLastCourseDate = (dateString: string | null) => {
    if (!dateString) return 'No courses completed';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(student.first_name, student.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground truncate">
              {student.first_name} {student.last_name}
            </div>
            {student.employee_number && (
              <div className="text-sm text-muted-foreground truncate">
                ID: {student.employee_number}
              </div>
            )}
            <Badge variant={getStatusVariant(student.status)} className="mt-1 text-xs">
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </Badge>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
          {student.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{student.phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium text-sm truncate">
            {student.teams?.name || 'No team'}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {student.teams?.groups?.name || 'No group'}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium">
            <span className="text-primary">{student.total_enrollments}</span>
            <span className="text-muted-foreground text-xs">enrollments</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {formatLastCourseDate(student.last_course_date)}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StudentActions studentId={student.id} />
      </TableCell>
    </TableRow>
  );
}
