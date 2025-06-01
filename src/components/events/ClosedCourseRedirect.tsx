
import { useParams, Navigate } from "react-router-dom";
import { useCourseClosure } from "./course-closure/hooks/useCourseClosure";
import { CourseAllocations } from "./CourseAllocations";

export function ClosedCourseRedirect() {
  const { id } = useParams();
  const courseId = id ? parseInt(id) : undefined;
  const { isClosed, isLoading } = useCourseClosure(courseId);

  // Show loading while checking closure status
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // If course is closed, redirect to analytics
  if (isClosed) {
    return <Navigate to={`/events/${id}/analytics`} replace />;
  }

  // If course is not closed, show normal allocations page
  return <CourseAllocations />;
}
