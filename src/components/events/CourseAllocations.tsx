
import { CourseHeader } from "./allocation/CourseHeader";
import { CourseDetailsCards } from "./allocation/CourseDetailsCards"; 
import { CourseInfoCards } from "./allocation/CourseInfoCards";
import { LoadingDisplay } from "./allocation/LoadingDisplay";
import { ErrorDisplay } from "./allocation/ErrorDisplay";
import { AllocationsContent } from "./allocation/AllocationsContent";
import { useAllocationData } from "./allocation/hooks/useAllocationData";
import { useSeatAllocation } from "./allocation/useSeatAllocation";
import { StudentsContent } from "./allocation/StudentsContent";
import { useCourseClosure } from "./course-closure/hooks/useCourseClosure";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowRight, Calendar, CheckCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CourseAllocations() {
  const navigate = useNavigate();
  // Use our custom hooks to get data and manage seat allocations
  const {
    courseInstance,
    existingAllocations,
    clients,
    saveAllocationsMutation,
    isLoading,
    error,
    id
  } = useAllocationData();

  const {
    allocations,
    remainingSeats,
    showAddForm,
    setShowAddForm,
    handleAddAllocation,
    handleRemoveAllocation,
    calculateTotals
  } = useSeatAllocation(existingAllocations, courseInstance);

  // Check course closure status
  const courseId = id ? parseInt(id) : undefined;
  const { isClosed, isDraft } = useCourseClosure(courseId);

  // Loading state
  if (isLoading) {
    return <LoadingDisplay text="Loading course allocations..." />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay title="Error loading course allocations" error={error} />;
  }

  // Check if this is a private course
  const isPrivateCourse = courseInstance && !courseInstance.is_open_enrollment;

  // Calculate totals for allocation stats
  const { totalAllocated, maxStudents, allocationPercentage } = calculateTotals();

  // Course closure logic
  const startDate = new Date(courseInstance.start_date);
  const endDate = courseInstance.end_date ? new Date(courseInstance.end_date) : null;
  const isCompleted = endDate ? endDate < new Date() : startDate < new Date();
  const canBeClosed = isCompleted && !isClosed;
  const isFutureCourse = startDate > new Date();

  // Determine course status
  const courseStatus = isClosed 
    ? "closed" 
    : isCompleted 
      ? "completed" 
      : "scheduled";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with back button */}
      <CourseHeader courseInstance={courseInstance} />

      {/* Course Details Cards */}
      <CourseDetailsCards 
        courseInstance={courseInstance}
        remainingSeats={remainingSeats}
        maxStudents={maxStudents}
        allocationPercentage={allocationPercentage}
      />

      {/* Program Details & Location Details */}
      <CourseInfoCards courseInstance={courseInstance} />

      {/* Course Actions Card */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-medium">Course Actions</h3>
              <p className="text-sm text-muted-foreground">
                Manage this course
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {courseStatus === "scheduled" && (
                <Button 
                  onClick={() => navigate(`/events/${courseInstance.id}/edit`)}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Edit Course
                </Button>
              )}
              
              {/* Course closure action button - varies based on status */}
              {courseStatus === "closed" ? (
                <Button 
                  variant="default"
                  onClick={() => navigate(`/events/${courseInstance.id}/close`)}
                  className="whitespace-nowrap"
                >
                  View Closure <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant={courseStatus === "completed" ? "default" : "outline"}
                  onClick={() => navigate(`/events/${courseInstance.id}/close`)}
                  disabled={!canBeClosed || isFutureCourse}
                  className="whitespace-nowrap"
                >
                  {courseStatus === "completed" ? "Finalize Course" : "Close Course"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status information */}
          {courseStatus === "closed" && (
            <Alert className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
              <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
              <AlertDescription className="text-sm">
                This course has been successfully closed.
              </AlertDescription>
            </Alert>
          )}
          
          {courseStatus === "completed" && !isClosed && (
            <Alert className="mt-4 bg-amber-50 border-amber-200 text-amber-800">
              <CheckCircle className="h-4 w-4 text-amber-600 mr-2" />
              <AlertDescription className="text-sm">
                This course has been completed but needs to be finalized.
              </AlertDescription>
            </Alert>
          )}
          
          {!canBeClosed && courseStatus === "scheduled" && !isFutureCourse && (
            <Alert className="mt-4 bg-gray-50 border-gray-200 text-gray-800">
              <Clock className="h-4 w-4 text-gray-600 mr-2" />
              <AlertDescription className="text-sm">
                This course cannot be closed until it is completed.
              </AlertDescription>
            </Alert>
          )}
          
          {isFutureCourse && (
            <Alert className="mt-4 bg-gray-50 border-gray-200 text-gray-800">
              <Calendar className="h-4 w-4 text-gray-600 mr-2" />
              <AlertDescription className="text-sm">
                This course is scheduled in the future and cannot be closed yet.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Show different content based on course type */}
      {isPrivateCourse ? (
        // Private Course: Show Students Management Component
        <StudentsContent 
          courseInstance={courseInstance}
          maxStudents={maxStudents}
        />
      ) : (
        // Open Enrollment Course: Show Allocations Component
        <AllocationsContent 
          allocations={allocations}
          remainingSeats={remainingSeats}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          handleAddAllocation={handleAddAllocation}
          handleRemoveAllocation={handleRemoveAllocation}
          totalAllocated={totalAllocated}
          maxStudents={maxStudents}
          saveAllocationsMutation={saveAllocationsMutation}
          clients={clients}
          courseInstance={courseInstance}
        />
      )}
    </div>
  );
}
