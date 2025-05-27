
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { ClientStudentsHeader } from "./students/ClientStudentsHeader";
import { StudentSearchAndFilters } from "./students/StudentSearchAndFilters";
import { StudentsTable } from "./students/StudentsTable";
import { EmptyStudentsState } from "./students/EmptyStudentsState";

interface ClientStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  employee_number: string | null;
  phone: string | null;
  total_enrollments: number;
  last_course_date: string | null;
  teams: {
    name: string;
    groups: {
      name: string;
    };
  };
}

interface ClientStudentsTabProps {
  clientId: string;
}

export function ClientStudentsTab({ clientId }: ClientStudentsTabProps) {
  const [studentFilter, setStudentFilter] = useState<"active" | "inactive">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: students, isLoading, error } = useQuery({
    queryKey: ['client-students', clientId],
    queryFn: async () => {
      try {
        console.log('Fetching students for client:', clientId);
        
        // First get all course instances for this client
        const { data: courseInstances, error: courseError } = await supabase
          .from('course_instances')
          .select('id')
          .eq('host_client_id', clientId);

        if (courseError) {
          console.error('Error fetching course instances:', courseError);
          throw courseError;
        }

        if (!courseInstances || courseInstances.length === 0) {
          return [];
        }

        const courseInstanceIds = courseInstances.map(ci => ci.id);

        // Then get students enrolled in these courses
        const { data, error } = await supabase
          .from('session_attendees')
          .select(`
            students:student_id (
              id,
              first_name,
              last_name,
              email,
              status,
              employee_number,
              phone,
              teams:team_id (
                name,
                groups:group_id (
                  name
                )
              )
            ),
            course_instances:course_instance_id (
              end_date
            )
          `)
          .in('course_instance_id', courseInstanceIds);

        if (error) {
          console.error('Error fetching client students:', error);
          throw error;
        }

        // Process and deduplicate students
        const studentMap = new Map();
        
        (data || []).forEach(attendee => {
          const student = attendee.students;
          const courseEndDate = attendee.course_instances?.end_date;
          
          if (student && student.id) {
            if (studentMap.has(student.id)) {
              const existing = studentMap.get(student.id);
              existing.total_enrollments += 1;
              
              // Update last course date if this one is more recent
              if (courseEndDate && (!existing.last_course_date || courseEndDate > existing.last_course_date)) {
                existing.last_course_date = courseEndDate;
              }
            } else {
              studentMap.set(student.id, {
                ...student,
                total_enrollments: 1,
                last_course_date: courseEndDate
              });
            }
          }
        });

        const studentsArray = Array.from(studentMap.values());
        console.log('Client students:', studentsArray);
        return studentsArray;
      } catch (error) {
        console.error('Error in students query:', error);
        throw error;
      }
    },
  });

  const filteredStudents = students?.filter(student => {
    const matchesStatus = studentFilter === "active" 
      ? student.status === 'active' 
      : student.status !== 'active';
    
    const matchesSearch = searchQuery === "" || 
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.employee_number && student.employee_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading students...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            Error loading students. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <ClientStudentsHeader />
        <CardContent>
          <StudentSearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            studentFilter={studentFilter}
            onFilterChange={setStudentFilter}
          />

          <TabsContent value={studentFilter} className="mt-4">
            {filteredStudents.length === 0 ? (
              <EmptyStudentsState 
                studentFilter={studentFilter}
                searchQuery={searchQuery}
              />
            ) : (
              <StudentsTable students={filteredStudents} />
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}
