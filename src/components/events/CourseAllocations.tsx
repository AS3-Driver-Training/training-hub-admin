
import { CourseHeader } from "./allocation/CourseHeader";
import { CourseDetailsCards } from "./allocation/CourseDetailsCards"; 
import { CourseInfoCards } from "./allocation/CourseInfoCards";
import { LoadingDisplay } from "./allocation/LoadingDisplay";
import { ErrorDisplay } from "./allocation/ErrorDisplay";
import { AllocationsContent } from "./allocation/AllocationsContent";
import { useAllocationData } from "./allocation/hooks/useAllocationData";
import { useSeatAllocation } from "./allocation/useSeatAllocation";
import { StudentsContent } from "./allocation/StudentsContent";

export function CourseAllocations() {
  // Use our custom hooks to get data and manage seat allocations
  const {
    courseInstance,
    existingAllocations,
    clients,
    saveAllocationsMutation,
    isLoading,
    error
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

  // Loading state
  if (isLoading) {
    return <LoadingDisplay />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Check if this is a private course
  const isPrivateCourse = courseInstance && !courseInstance.is_open_enrollment;

  // Calculate totals for allocation stats
  const { totalAllocated, maxStudents, allocationPercentage } = calculateTotals();

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
