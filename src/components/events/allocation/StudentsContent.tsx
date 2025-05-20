import { useState } from "react";
import { Users, Info, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StudentsList } from "./StudentsList";
import { useStudentManagement } from "./students/hooks/useStudentManagement";
import { EmptyState } from "./students/EmptyState";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useProfile } from "@/hooks/useProfile";
interface StudentsContentProps {
  courseInstance: any;
  maxStudents: number;
}
export function StudentsContent({
  courseInstance,
  maxStudents
}: StudentsContentProps) {
  const navigate = useNavigate();
  const [showStudentsList, setShowStudentsList] = useState(false);
  const {
    userRole
  } = useProfile();

  // Check if user has admin privileges (superadmin or admin role)
  const hasAdminPrivileges = userRole === 'superadmin' || userRole === 'admin';
  const {
    students,
    enrolledCount,
    isLoading
  } = useStudentManagement(courseInstance?.id, courseInstance?.host_client?.id || '');
  const clientName = courseInstance?.host_client?.name || 'Unknown Client';
  const allocatedSeats = courseInstance?.private_seats_allocated || 0;

  // Determine if course is in the past (completed)
  const isCompleted = courseInstance && new Date(courseInstance.end_date || courseInstance.start_date) < new Date();

  // Admin users can edit even completed courses
  const isReadOnly = isCompleted && !hasAdminPrivileges;
  return <Card className="border shadow-sm mb-8">
      <CardHeader className="border-b bg-slate-50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Students Management</CardTitle>
            <CardDescription>
              {isCompleted ? `View students who attended this completed course for ${clientName}` : `Manage students for this private course for ${clientName}`}
            </CardDescription>
          </div>
          
          <Button onClick={() => setShowStudentsList(true)} size="sm" variant="default">
            <Users className="h-4 w-4 mr-2" />
            Manage Students
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
          </div> : students.length === 0 ? <EmptyState onAddNew={isReadOnly ? undefined : () => setShowStudentsList(true)} availableSeats={allocatedSeats - enrolledCount} isCompleted={isCompleted} hasAdminPrivileges={hasAdminPrivileges} /> : <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b">
                <h3 className="font-medium">Enrolled Students ({enrolledCount})</h3>
              </div>
              <div className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.filter(s => s.enrolled).map(student => <TableRow key={student.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="font-medium text-blue-800">
                {enrolledCount} of {allocatedSeats} available seats filled.
              </AlertDescription>
            </Alert>
            
            {!isReadOnly && <div className="flex justify-center mt-4">
                
              </div>}
          </div>}

        {/* Student Management Dialog */}
        {showStudentsList && <StudentsList clientId={courseInstance?.host_client?.id || ''} clientName={clientName} seatsAllocated={allocatedSeats} onClose={() => setShowStudentsList(false)} courseInstanceId={courseInstance?.id} />}

        <div className="flex items-center justify-end mt-4 pt-4 border-t">
          <Button onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </CardContent>
    </Card>;
}