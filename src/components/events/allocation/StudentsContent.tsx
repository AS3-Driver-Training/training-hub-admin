
import { useState } from "react";
import { Plus, Users, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StudentsList } from "./StudentsList";
import { useManageStudents } from "./hooks/useManageStudents";

interface StudentsContentProps {
  courseInstance: any;
  maxStudents: number;
}

export function StudentsContent({ courseInstance, maxStudents }: StudentsContentProps) {
  const navigate = useNavigate();
  const [showStudentsList, setShowStudentsList] = useState(false);
  
  const { 
    students, 
    enrolledCount,
    isLoading
  } = useManageStudents(courseInstance?.id);
  
  const clientName = courseInstance?.host_client?.name || 'Unknown Client';
  const allocatedSeats = courseInstance?.private_seats_allocated || 0;
  
  return (
    <Card className="border shadow-sm mb-8">
      <CardHeader className="border-b bg-slate-50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Students Management</CardTitle>
            <CardDescription>
              Manage students for this private course for {clientName}
            </CardDescription>
          </div>
          
          <Button 
            onClick={() => setShowStudentsList(true)}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Students
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-slate-50 mb-6">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-medium mb-1">No Students Added</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There are no students enrolled in this course yet.
            </p>
            <Button 
              onClick={() => setShowStudentsList(true)}
              className="mt-2"
            >
              Add Students
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b">
                <h3 className="font-medium">Enrolled Students ({enrolledCount})</h3>
              </div>
              <div className="p-4">
                <ul className="divide-y">
                  {students.filter(s => s.enrolled).map((student) => (
                    <li key={student.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="font-medium text-blue-800">
                {enrolledCount} of {allocatedSeats} available seats filled.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Student Management Dialog */}
        {showStudentsList && (
          <StudentsList 
            clientId={courseInstance?.host_client?.id || ''}
            clientName={clientName}
            seatsAllocated={allocatedSeats}
            onClose={() => setShowStudentsList(false)}
          />
        )}

        <div className="flex items-center justify-end mt-4 pt-4 border-t">
          <Button
            onClick={() => navigate("/events")}
          >
            Back to Events
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
