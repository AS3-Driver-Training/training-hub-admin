
import { Check, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Student } from "./types";
import { EmptyState } from "./EmptyState";

interface StudentTableProps {
  students: Student[];
  toggleEnrollment: (id: string) => void;
  seatsRemaining: number;
}

export function StudentTable({ students, toggleEnrollment, seatsRemaining }: StudentTableProps) {
  if (students.length === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollArea className="h-[300px]">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.firstName} {student.lastName}
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.phone || "-"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleEnrollment(student.id)}
                  className={
                    student.enrolled
                      ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }
                  disabled={!student.enrolled && seatsRemaining <= 0}
                >
                  {student.enrolled ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Unenroll
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Enroll
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
