
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, Users } from "lucide-react";
import { StudentTable } from "./StudentTable";
import { EmptyState } from "./EmptyState";
import { useStudentManagement } from "./hooks/useStudentManagement";
import { StudentFormValues } from "./types";
import { EnhancedStudentSelection } from "./EnhancedStudentSelection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface StudentsListProps {
  clientId: string;
  clientName: string;
  seatsAllocated: number;
  onClose: () => void;
  courseInstanceId: number;
}

export function StudentsList({ 
  clientId, 
  clientName, 
  seatsAllocated, 
  onClose,
  courseInstanceId
}: StudentsListProps) {
  const [showForm, setShowForm] = useState(false);
  const { userRole } = useProfile();
  
  // Check if user has admin privileges (superadmin or admin role)
  const hasAdminPrivileges = userRole === 'superadmin' || userRole === 'admin';
  
  // Fetch course information to determine if it's open enrollment
  const { data: courseInstance, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['courseInstance', courseInstanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_instances')
        .select('is_open_enrollment, start_date, end_date')
        .eq('id', courseInstanceId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });
  
  // Determine if course is in the past (completed)
  const isCompleted = courseInstance && new Date(courseInstance.end_date || courseInstance.start_date) < new Date();
  
  // Admin users can edit even completed courses
  const isReadOnly = isCompleted && !hasAdminPrivileges;
  
  const isOpenEnrollment = courseInstance?.is_open_enrollment || false;
  
  const {
    students,
    enrolledCount,
    isLoading,
    enrollStudent,
    unenrollStudent,
    addStudent
  } = useStudentManagement(courseInstanceId, clientId);
  
  const availableSeats = seatsAllocated - enrolledCount;
  
  const handleAddStudent = async (studentData: StudentFormValues) => {
    await addStudent({
      ...studentData,
      // status will now be handled in useStudentManagement instead
    });
    setShowForm(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isReadOnly ? "View Students" : "Manage Students"} - {clientName}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="py-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">
                {enrolledCount} of {seatsAllocated} seats filled
              </span>
            </div>
            
            {!showForm && students.length > 0 && !isReadOnly && (
              <Button 
                onClick={() => setShowForm(true)}
                disabled={availableSeats <= 0}
              >
                Add Students
              </Button>
            )}
          </div>
          
          {availableSeats <= 0 && !isReadOnly && (
            <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="font-medium text-amber-800">
                All available seats have been filled. No more students can be added.
              </AlertDescription>
            </Alert>
          )}
          
          {isCompleted && (
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="font-medium text-blue-800">
                {hasAdminPrivileges 
                  ? "This course has been completed. As an admin, you can still make changes to the student roster."
                  : "This course has been completed. Student roster can only be viewed."
                }
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading || isLoadingCourse ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {showForm && !isReadOnly && (
                <EnhancedStudentSelection
                  courseInstanceId={courseInstanceId}
                  clientId={clientId}
                  isOpenEnrollment={isOpenEnrollment}
                  availableSeats={seatsAllocated}
                  onAddStudent={handleAddStudent}
                  onClose={() => setShowForm(false)}
                />
              )}
              
              {students.length > 0 ? (
                <StudentTable 
                  students={students}
                  enrolledCount={enrolledCount}
                  maxSeats={seatsAllocated}
                  onEnrollStudent={isReadOnly ? undefined : enrollStudent}
                  onUnenrollStudent={isReadOnly ? undefined : unenrollStudent}
                />
              ) : (
                <EmptyState 
                  onAddNew={isReadOnly ? undefined : () => setShowForm(true)} 
                  availableSeats={availableSeats}
                  isCompleted={isCompleted}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
