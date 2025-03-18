
import { useState } from "react";
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

// Define the student schema
const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional()
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
  
  // Mock data - in a real app, this would come from Supabase
  const [students, setStudents] = useState<Student[]>([
    { id: "1", firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "555-1234", enrolled: true },
    { id: "2", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phone: "555-5678", enrolled: false },
    { id: "3", firstName: "Bob", lastName: "Johnson", email: "bob.johnson@example.com", phone: "555-9012", enrolled: false },
  ]);

  // Form setup
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });

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
  const onSubmit = (values: StudentFormValues) => {
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

    const newStudent: Student = {
      id: (students.length + 1).toString(),
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
