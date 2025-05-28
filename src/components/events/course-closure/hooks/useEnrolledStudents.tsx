
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type EnrolledStudent = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

// Simplified student data for course closure
export type CourseClosureStudent = {
  id: string;
  name: string;
};

export function useEnrolledStudents(courseInstanceId: number | undefined) {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseInstanceId) {
      setIsLoading(false);
      return;
    }

    const fetchEnrolledStudents = async () => {
      setIsLoading(true);
      
      try {
        // Get all attendees for this course instance that are confirmed
        const { data: attendees, error: attendeesError } = await supabase
          .from('session_attendees')
          .select(`
            student_id
          `)
          .eq('course_instance_id', courseInstanceId)
          .neq('status', 'cancelled');
          
        if (attendeesError) throw attendeesError;
        
        if (!attendees || attendees.length === 0) {
          setStudents([]);
          setIsLoading(false);
          return;
        }
        
        const studentIds = attendees.map(a => a.student_id);
        
        // Get student details for the enrolled students
        const { data: studentDetails, error: studentsError } = await supabase
          .from('students')
          .select(`
            id,
            first_name,
            last_name,
            email
          `)
          .in('id', studentIds);
        
        if (studentsError) throw studentsError;
        
        setStudents(studentDetails || []);
      } catch (err: any) {
        console.error("Error fetching enrolled students:", err);
        setError(err.message || "Failed to load enrolled students");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledStudents();
  }, [courseInstanceId]);

  // Transform students for course closure (name + UUID only)
  const getStudentsForClosure = (): CourseClosureStudent[] => {
    return students.map(student => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`
    }));
  };

  return {
    students,
    isLoading,
    error,
    getStudentsForClosure
  };
}
