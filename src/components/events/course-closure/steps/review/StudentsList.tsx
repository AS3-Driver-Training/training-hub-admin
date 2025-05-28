
import React from "react";
import { Users, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseStudent } from "@/types/programs";

interface StudentsListProps {
  students: CourseStudent[];
}

export function StudentsList({ students }: StudentsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Enrolled Students ({students.length})
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="font-mono text-sm">{student.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Alert variant="default" className="bg-slate-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No students are enrolled in this course.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
