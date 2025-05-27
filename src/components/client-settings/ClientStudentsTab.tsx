
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search, AlertCircle, Mail, Phone, Calendar, MoreHorizontal, User, History, Edit } from "lucide-react";
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
                  <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {searchQuery 
                        ? `No ${studentFilter} students match your search`
                        : `No ${studentFilter} students found`
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery 
                        ? "Try adjusting your search terms"
                        : `This client doesn't have any ${studentFilter} students yet`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[35%]">Student</TableHead>
                          <TableHead className="w-[25%]">Contact</TableHead>
                          <TableHead className="w-[20%]">Team/Group</TableHead>
                          <TableHead className="w-[15%]">Activity</TableHead>
                          <TableHead className="w-[5%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-muted/20">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {getInitials(student.first_name, student.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-foreground truncate">
                                    {student.first_name} {student.last_name}
                                  </div>
                                  {student.employee_number && (
                                    <div className="text-sm text-muted-foreground truncate">
                                      ID: {student.employee_number}
                                    </div>
                                  )}
                                  <Badge variant={getStatusVariant(student.status)} className="mt-1 text-xs">
                                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="truncate">{student.email}</span>
                                </div>
                                {student.phone && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{student.phone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm truncate">
                                  {student.teams?.name || 'No team'}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {student.teams?.groups?.name || 'No group'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <span className="text-primary">{student.total_enrollments}</span>
                                  <span className="text-muted-foreground text-xs">enrollments</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {formatLastCourseDate(student.last_course_date)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Student
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <History className="mr-2 h-4 w-4" />
                                    Enrollment History
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
