
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CourseHeaderProps {
  courseInstance: any;
}

export function CourseHeader({ courseInstance }: CourseHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/events")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Course Details
        </h1>
      </div>
      <p className="text-muted-foreground">
        {courseInstance?.start_date && format(new Date(courseInstance.start_date), "MMMM d, yyyy")} - 
        {courseInstance?.end_date && format(new Date(courseInstance.end_date), " MMMM d, yyyy")}
      </p>
    </div>
  );
}
