
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StudentWithRelations } from "@/types/students";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface CoursesTabProps {
  student: StudentWithRelations;
}

export function CoursesTab({ student }: CoursesTabProps) {
  // Fetch courses this student is enrolled in
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['student-courses', student.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_attendees')
        .select(`
          id,
          status,
          attendance_confirmed_at,
          special_requests,
          reschedule_request,
          course_instances:course_instance_id (
            id,
            start_date,
            end_date,
            programs:program_id (
              name
            ),
            venues:venue_id (
              name
            )
          )
        `)
        .eq('student_id', student.id)
        .order('course_instances.start_date', { ascending: false });
      
      if (error) {
        console.error("Error fetching student enrollments:", error);
        throw error;
      }
      
      console.log("Student enrollments:", data);
      return data || [];
    }
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Enrollments</h3>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Enroll in Course
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          This student is not enrolled in any courses.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.course_instances.programs.name}</TableCell>
                <TableCell>
                  {format(new Date(enrollment.course_instances.start_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{enrollment.course_instances.venues.name}</TableCell>
                <TableCell>
                  <StatusBadge status={enrollment.status} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants = {
    confirmed: "success",
    pending: "outline",
    unable: "destructive"
  } as const;
  
  const variant = status in variants 
    ? variants[status as keyof typeof variants] 
    : "secondary";
    
  return <Badge variant={variant}>{status}</Badge>;
}
