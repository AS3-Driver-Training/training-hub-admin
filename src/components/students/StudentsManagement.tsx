
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StudentsList } from "./StudentsList";
import { StudentsHeader } from "./StudentsHeader";
import { StudentSearch } from "./StudentSearch";
import { Student } from "@/types/students";
import { useTeams } from "@/hooks/useTeams";

export function StudentsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch teams for use in the student forms
  const { isLoading: isTeamsLoading } = useTeams();
  
  const { data: students = [], isLoading: isStudentsLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          teams:team_id (
            name, 
            group_id,
            groups:group_id (
              name, 
              client_id,
              clients:client_id (
                name
              )
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching students:", error);
        throw error;
      }
      
      console.log("Students data:", data);
      return data || [];
    }
  });
  
  const filteredStudents = students.filter((student: Student) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(searchTerm) ||
      student.last_name.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm) ||
      (student.employee_number && student.employee_number.toLowerCase().includes(searchTerm))
    );
  });
  
  const isLoading = isTeamsLoading || isStudentsLoading;
  
  return (
    <div className="container space-y-6 py-6">
      <StudentsHeader />
      <StudentSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <StudentsList 
        students={filteredStudents} 
        isLoading={isLoading} 
        error={error}
      />
    </div>
  );
}
