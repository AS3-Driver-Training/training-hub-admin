
import React from "react";
import { Users, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEnrolledStudents } from "../../hooks/useEnrolledStudents";
import { CourseInstanceWithClient } from "../../CourseClosureWizard";

interface StudentsListProps {
  courseInstance: CourseInstanceWithClient;
}

export function StudentsList({ courseInstance }: StudentsListProps) {
  const { students, isLoading: studentsLoading } = useEnrolledStudents(courseInstance?.id);
  
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
        {studentsLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
          </div>
        ) : students.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.first_name} {student.last_name}</TableCell>
                  <TableCell>{student.email}</TableCell>
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
