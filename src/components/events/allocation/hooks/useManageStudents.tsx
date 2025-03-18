
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enrolled: boolean;
}

export function useManageStudents(courseInstanceId: number) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would fetch students from the database
  // For now, we'll use mock data
  useEffect(() => {
    setIsLoading(true);
    
    // This would be replaced with an actual API call in a real implementation
    const fetchStudents = async () => {
      try {
        // Mock data for now - in a real app, this would be fetched from Supabase
        // const { data, error } = await supabase
        //   .from("course_students")
        //   .select("*")
        //   .eq("course_instance_id", courseInstanceId);
        
        // if (error) throw error;

        // Simulating API response with mock data
        const mockData = [
          { id: "1", firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "555-1234", enrolled: true },
          { id: "2", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phone: "555-5678", enrolled: true },
          { id: "3", firstName: "Bob", lastName: "Johnson", email: "bob.johnson@example.com", phone: "555-9012", enrolled: false },
        ];

        setStudents(mockData);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching students:", error);
        setError(error.message);
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
