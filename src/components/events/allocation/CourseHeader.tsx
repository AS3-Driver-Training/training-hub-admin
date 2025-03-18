
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CourseHeaderProps {
  courseInstance: any;
}

export function CourseHeader({ courseInstance }: CourseHeaderProps) {
  const navigate = useNavigate();

  // Get course name from the program
  const courseName = courseInstance?.program?.name || "Loading...";

  // Format dates for display - using proper error handling for date parsing
  let startDateFormatted = "Date not available";
  let endDateFormatted = "";
  
  // Format start date if available
  if (courseInstance?.start_date) {
    try {
      const startDate = new Date(courseInstance.start_date);
      startDateFormatted = format(startDate, "MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting start date:", error);
    }
  }
  
  // Format end date if available
  if (courseInstance?.end_date) {
    try {
      const endDate = new Date(courseInstance.end_date);
      endDateFormatted = format(endDate, "MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting end date:", error);
    }
  }
  
  // Create final date display string
  const dateDisplay = endDateFormatted 
    ? `${startDateFormatted} - ${endDateFormatted}` 
    : startDateFormatted;

  return (
    <div className="mb-8">
      <div className="flex items-center mb-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/events")}
          className="mr-4 p-0"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mt-2">
        {courseName}
      </h1>
      <p className="text-muted-foreground mt-1">
        {dateDisplay}
      </p>
    </div>
  );
}
