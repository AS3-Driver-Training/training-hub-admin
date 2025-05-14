
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, Users } from "lucide-react";
import { StudentForm } from "./StudentForm";
import { StudentTable } from "./StudentTable";
import { EmptyState } from "./EmptyState";
import { useStudentManagement } from "./hooks/useStudentManagement";
import { StudentFormValues } from "./types";

interface StudentsListProps {
  clientId: string;
  clientName: string;
  seatsAllocated: number;
  onClose: () => void;
  courseInstanceId?: number;
}

export function StudentsList({ 
  clientId, 
  clientName, 
  seatsAllocated, 
  onClose,
  courseInstanceId = 0 // Use 0 as default if not provided
}: StudentsListProps) {
  const [showForm, setShowForm] = useState(false);
  
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
      status: 'active',
    });
    setShowForm(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Manage Students - {clientName}
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
            
            {!showForm && students.length > 0 && (
              <Button 
                onClick={() => setShowForm(true)}
                disabled={availableSeats <= 0}
              >
                Add New Student
              </Button>
            )}
          </div>
          
          {availableSeats <= 0 && (
            <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="font-medium text-amber-800">
                All available seats have been filled. No more students can be added.
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {showForm && (
                <StudentForm 
                  onAddStudent={handleAddStudent}
                  onCancel={() => setShowForm(false)}
                  availableSeats={availableSeats}
                />
              )}
              
              {students.length > 0 ? (
                <StudentTable 
                  students={students}
                  enrolledCount={enrolledCount}
                  maxSeats={seatsAllocated}
                  onEnrollStudent={enrollStudent}
                  onUnenrollStudent={unenrollStudent}
                />
              ) : (
                <EmptyState 
                  onAddNew={() => setShowForm(true)} 
                  availableSeats={availableSeats}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
