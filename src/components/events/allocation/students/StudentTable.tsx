
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, User } from "lucide-react";
import { Student } from "./types";

interface StudentTableProps {
  students: Student[];
  enrolledCount: number;
  maxSeats: number;
  onEnrollStudent: (studentId: string) => void;
  onUnenrollStudent: (studentId: string) => void;
}

export function StudentTable({ 
  students, 
  enrolledCount, 
  maxSeats, 
  onEnrollStudent, 
  onUnenrollStudent 
}: StudentTableProps) {
  const availableSeats = maxSeats - enrolledCount;
  
  return (
    <div>
      {students.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{student.first_name} {student.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                  <TableCell>
                    {student.enrolled ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Enrolled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        Not Enrolled
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {student.enrolled ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onUnenrollStudent(student.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-1 text-rose-600" />
                        Remove
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEnrollStudent(student.id)}
                        disabled={availableSeats <= 0}
                      >
                        <UserPlus className="h-4 w-4 mr-1 text-green-600" />
                        Add
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-slate-50">
          <p className="text-muted-foreground">No students found</p>
        </div>
      )}
    </div>
  );
}
