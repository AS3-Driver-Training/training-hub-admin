
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
        {courseInstance?.start_date && format(new Date(courseInstance.start_date), "MMMM d, yyyy")} - 
        {courseInstance?.end_date && format(new Date(courseInstance.end_date), " MMMM d, yyyy")}
      </p>
    </div>
  );
}
