
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, UserCog } from "lucide-react";
import { StudentWithRelations } from "@/types/students";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ManageStudentDialog } from "./ManageStudentDialog";

interface StudentsListProps {
  students: StudentWithRelations[];
  isLoading: boolean;
  error: Error | null;
}

export function StudentsList({ students, isLoading, error }: StudentsListProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentWithRelations | null>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-destructive">Error loading students</h3>
            <div className="text-sm text-destructive/90 mt-2">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (students.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center text-center h-64">
        <h3 className="text-lg font-medium mb-2">No students found</h3>
        <p className="text-muted-foreground mb-4">
          Add your first student or import students from CSV.
        </p>
      </Card>
    );
  }
  
  const handleManageStudent = (student: StudentWithRelations) => {
    setSelectedStudent(student);
    setShowManageDialog(true);
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <div className="font-medium">{student.first_name} {student.last_name}</div>
                {student.employee_number && (
                  <div className="text-sm text-muted-foreground">#{student.employee_number}</div>
                )}
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div>{student.teams?.name || "-"}</div>
                  <div className="text-xs text-muted-foreground">
                    {student.teams?.groups?.clients?.name || "-"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={student.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleManageStudent(student)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Manage</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {}}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {showManageDialog && selectedStudent && (
        <ManageStudentDialog 
          student={selectedStudent}
          open={showManageDialog}
          onOpenChange={setShowManageDialog}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants = {
    active: "success",
    inactive: "destructive",
    suspended: "warning",
    pending: "outline",
  } as const;
  
  const variant = status in variants 
    ? variants[status as keyof typeof variants] 
    : "secondary";
    
  return <Badge variant={variant}>{status}</Badge>;
}
