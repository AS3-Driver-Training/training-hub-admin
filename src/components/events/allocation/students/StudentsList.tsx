
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { StudentForm } from "./StudentForm";
import { StudentTable } from "./StudentTable";
import { Student } from "./types";

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

  // Add a student to the list
  const addStudent = (newStudent: Student) => {
    setStudents([...students, newStudent]);
    setIsAddingStudent(false);
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
          <StudentForm 
            clientId={clientId} 
            onCancel={() => setIsAddingStudent(false)} 
            onAddStudent={addStudent} 
            seatsRemaining={seatsAllocated - enrolledCount}
          />
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
