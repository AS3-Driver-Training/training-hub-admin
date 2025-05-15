
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enrolled: boolean;
  status?: string;
  attendanceStatus?: 'present' | 'absent' | 'late' | null;
}

export function useManageStudents(courseInstanceId: number) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseInstanceId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // First get the client ID associated with this course
        const { data: courseInstance, error: courseError } = await supabase
          .from('course_instances')
          .select('host_client_id')
          .eq('id', courseInstanceId)
          .single();
        
        if (courseError) throw courseError;
        
        if (!courseInstance?.host_client_id) {
          setError("No client associated with this course");
          setIsLoading(false);
          return;
        }
        
        // Get all attendees for this course instance
        const { data: attendees, error: attendeesError } = await supabase
          .from('session_attendees')
          .select(`
            id,
            student_id,
            status
          `)
          .eq('course_instance_id', courseInstanceId);
          
        if (attendeesError) throw attendeesError;
        
        // Get enrolled student IDs
        const enrolledStudentIds = attendees
          ?.filter(a => a.status !== 'cancelled')
          .map(a => a.student_id) || [];
        
        // Get all students from the client
        const { data: clientStudents, error: studentsError } = await supabase
          .from('students')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            status
          `)
          .eq('team_id', courseInstance.host_client_id);
        
        if (studentsError) throw studentsError;
        
        // Format the students with enrollment status
        const formattedStudents = clientStudents?.map(student => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          phone: student.phone || undefined,
          status: student.status,
          enrolled: enrolledStudentIds.includes(student.id),
          attendanceStatus: null // Will be populated for completed courses
        })) || [];
        
        setStudents(formattedStudents);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        setError(err.message || "Failed to load students");
        toast.error("Error loading students");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [courseInstanceId]);

  // Calculate enrolled students count
  const enrolledCount = students.filter(student => student.enrolled).length;

  return {
    students,
    setStudents,
    enrolledCount,
    isLoading,
    error
  };
}
