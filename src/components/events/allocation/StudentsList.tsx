
import { useState, useEffect } from "react";
import { Check, Plus, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define the student schema
const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  groupId: z.string().min(1, "Group is required"),
  teamId: z.string().min(1, "Team is required"),
  active: z.boolean().default(true)
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enrolled: boolean;
}

// Add interfaces for clients, groups, teams
interface Client {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  client_id: string;
  is_default?: boolean;
}

interface Team {
  id: string;
  name: string;
  group_id: string;
}

interface StudentsListProps {
  clientId: string;
  clientName: string;
  seatsAllocated: number;
  onClose: () => void;
}

export function StudentsList({ clientId, clientName, seatsAllocated, onClose }: StudentsListProps) {
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "enrolled">("enrolled");
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  
  // Mock data - in a real app, this would come from Supabase
  const [students, setStudents] = useState<Student[]>([
    { id: "1", firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "555-1234", enrolled: true },
    { id: "2", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phone: "555-5678", enrolled: false },
    { id: "3", firstName: "Bob", lastName: "Johnson", email: "bob.johnson@example.com", phone: "555-9012", enrolled: false },
  ]);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Could not fetch clients",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Client[];
    }
  });

  // Fetch groups based on selected client
  const { data: groups = [], refetch: refetchGroups } = useQuery({
    queryKey: ['groups', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, client_id, is_default')
        .eq('client_id', selectedClientId)
        .order('name');
      
      if (error) {
        console.error("Error fetching groups:", error);
        toast({
          title: "Error",
          description: "Could not fetch groups",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Group[];
    },
    enabled: !!selectedClientId
  });

  // Fetch teams based on selected group
  const { data: teams = [], refetch: refetchTeams } = useQuery({
    queryKey: ['teams', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, group_id')
        .eq('group_id', selectedGroupId)
        .order('name');
      
      if (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error",
          description: "Could not fetch teams",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Team[];
    },
    enabled: !!selectedGroupId
  });

  // Form setup
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      clientId: "",
      groupId: "",
      teamId: "",
      active: true
    }
  });

  // Set clientId from prop if it's provided
  useEffect(() => {
    if (clientId) {
      form.setValue("clientId", clientId);
      setSelectedClientId(clientId);
    }
  }, [clientId, form]);

  // When the client changes, update the groups and clear the group/team selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'clientId' && value.clientId) {
        setSelectedClientId(value.clientId as string);
        form.setValue("groupId", ""); // Clear group selection
        form.setValue("teamId", "");  // Clear team selection
        setSelectedGroupId("");
      } else if (name === 'groupId' && value.groupId) {
        setSelectedGroupId(value.groupId as string);
        form.setValue("teamId", "");  // Clear team selection
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // When groups data changes and there's only one group (the default), auto-select it
  useEffect(() => {
    if (groups && groups.length === 1) {
      form.setValue("groupId", groups[0].id);
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, form]);

  // When teams data changes and there's only one team (the default), auto-select it
  useEffect(() => {
    if (teams && teams.length === 1) {
      form.setValue("teamId", teams[0].id);
    }
  }, [teams, form]);

  // Filter students based on search and active tab
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "enrolled") {
      return matchesSearch && student.enrolled;
    }
    return matchesSearch;
  });

  // Count enrolled students
  const enrolledCount = students.filter(student => student.enrolled).length;

  // Toggle enrollment status
  const toggleEnrollment = (studentId: string) => {
    // Check if we can enroll more students
    const currentEnrolled = students.filter(s => s.enrolled).length;
    const studentToToggle = students.find(s => s.id === studentId);
    
    if (!studentToToggle) return;
    
    if (!studentToToggle.enrolled && currentEnrolled >= seatsAllocated) {
      toast({
        title: "Cannot enroll more students",
        description: `You have allocated ${seatsAllocated} seats for ${clientName}`,
        variant: "destructive"
      });
      return;
    }

    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, enrolled: !student.enrolled } 
        : student
    ));

    toast({
      title: studentToToggle.enrolled ? "Student unenrolled" : "Student enrolled",
      description: `${studentToToggle.firstName} ${studentToToggle.lastName} has been ${studentToToggle.enrolled ? "unenrolled from" : "enrolled in"} the course.`
    });
  };

  // Add new student
  const onSubmit = async (values: StudentFormValues) => {
    try {
      // Check if we can enroll more students
      const currentEnrolled = students.filter(s => s.enrolled).length;
      
      if (currentEnrolled >= seatsAllocated) {
        toast({
          title: "Cannot add more students",
          description: `You have allocated ${seatsAllocated} seats for ${clientName}`,
          variant: "destructive"
        });
        return;
      }

      // First, add the student to the database
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone || null,
          team_id: values.teamId,
          status: values.active ? 'active' : 'inactive'
        })
        .select()
        .single();

      if (studentError) {
        throw studentError;
      }

      // Add the student to the list with enrolled status
      const newStudent: Student = {
        id: studentData.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        enrolled: true // Automatically enroll new students
      };

      setStudents([...students, newStudent]);
      setIsAddingStudent(false);
      form.reset();

      toast({
        title: "Student added",
        description: `${values.firstName} ${values.lastName} has been added and enrolled.`
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Find default group in the selected client
  const getDefaultGroup = (): Group | undefined => {
    return groups.find(g => g.is_default);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Students for {clientName}</DialogTitle>
          <DialogDescription>
            Add, view or enroll students for this course.
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="outline" className="bg-slate-100">
                {enrolledCount} of {seatsAllocated} seats filled
              </Badge>
              <Button 
                size="sm" 
                onClick={() => setIsAddingStudent(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={isAddingStudent || enrolledCount >= seatsAllocated}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>

        {isAddingStudent ? (
          <div className="py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset group and team when client changes
                            form.setValue("groupId", "");
                            form.setValue("teamId", "");
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="groupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={!form.watch("clientId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {groups.map(group => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name} {group.is_default ? "(Default)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={!form.watch("groupId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams.map(team => (
                              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Active
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingStudent(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                    Add Student
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="enrolled" onValueChange={(value) => setActiveTab(value as "all" | "enrolled")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="enrolled">Enrolled ({enrolledCount})</TabsTrigger>
                <TabsTrigger value="all">All Students ({students.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="enrolled" className="mt-0">
                <StudentTable 
                  students={filteredStudents.filter(s => s.enrolled)} 
                  toggleEnrollment={toggleEnrollment} 
                  seatsRemaining={seatsAllocated - enrolledCount}
                />
              </TabsContent>
              <TabsContent value="all" className="mt-0">
                <StudentTable 
                  students={filteredStudents} 
                  toggleEnrollment={toggleEnrollment}
                  seatsRemaining={seatsAllocated - enrolledCount}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StudentTableProps {
  students: Student[];
  toggleEnrollment: (id: string) => void;
  seatsRemaining: number;
}

function StudentTable({ students, toggleEnrollment, seatsRemaining }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-slate-50">
        <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base font-medium mb-1">No students found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or add new students
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.firstName} {student.lastName}
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.phone || "-"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleEnrollment(student.id)}
                  className={
                    student.enrolled
                      ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }
                  disabled={!student.enrolled && seatsRemaining <= 0}
                >
                  {student.enrolled ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Unenroll
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Enroll
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
