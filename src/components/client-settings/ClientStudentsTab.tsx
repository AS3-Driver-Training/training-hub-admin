
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, AlertCircle, Mail, Calendar } from "lucide-react";
import { useState } from "react";

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

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

  const formatLastCourseDate = (dateString: string | null) => {
    if (!dateString) return 'No courses completed';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students by name, email, or employee number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={studentFilter} onValueChange={(value) => setStudentFilter(value as "active" | "inactive")}>
              <TabsList>
                <TabsTrigger value="active">Active Students</TabsTrigger>
                <TabsTrigger value="inactive">Inactive Students</TabsTrigger>
              </TabsList>

              <TabsContent value={studentFilter}>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? `No ${studentFilter} students match your search.`
                        : `No ${studentFilter} students found for this client.`
                      }
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Team/Group</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Last Course</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {student.first_name} {student.last_name}
                              </div>
                              {student.employee_number && (
                                <div className="text-sm text-muted-foreground">
                                  ID: {student.employee_number}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{student.email}</span>
                              </div>
                              {student.phone && (
                                <div className="text-sm text-muted-foreground">
                                  {student.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.teams?.name || 'No team'}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.teams?.groups?.name || 'No group'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(student.status)}>
                              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{student.total_enrollments}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {formatLastCourseDate(student.last_course_date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
