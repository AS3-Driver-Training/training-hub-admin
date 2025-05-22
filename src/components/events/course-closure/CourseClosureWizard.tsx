
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingDisplay } from "../allocation/LoadingDisplay";
import { ErrorDisplay } from "../allocation/ErrorDisplay";
import { WizardProvider } from "./wizard/WizardContext";
import { WizardNavigation, WizardProgress } from "./wizard/WizardNavigation";
import { WizardContent } from "./wizard/WizardContent";
import { useCourseData } from "./wizard/useCourseData";

// Define a proper type for the course instance data that includes clientName
export interface CourseInstanceWithClient {
  id: number;
  start_date: string;
  end_date: string | null;
  programs: { id: number; name: string; };
  venues: { id: number; name: string; country?: string; };
  host_client_id: string | null;
  clientName?: string;
}

export function CourseClosureWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id) : undefined;
  
  return (
    <WizardProvider courseId={courseId}>
      <CourseClosureContent courseId={courseId} navigate={navigate} />
    </WizardProvider>
  );
}

interface CourseClosureContentProps {
  courseId?: number;
  navigate: (path: string) => void;
}

function CourseClosureContent({ courseId, navigate }: CourseClosureContentProps) {
  const { courseInstance, isLoading, error, submitMutation, updateMutation } = useCourseData(courseId);
  const { isEditing } = useWizardContext();
  
  if (isLoading) {
    return <LoadingDisplay text="Loading course details..." />;
  }

  if (error || !courseInstance) {
    return (
      <ErrorDisplay
        title="Error loading course details"
        error={error}
        onBack={() => navigate(`/events/${courseId}`)}
      />
    );
  }

  const handleSubmit = () => {
    // If we're editing an existing closure, use update mutation
    if (isEditing) {
      updateMutation.mutate();
    } else {
      submitMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(`/events/${courseId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <h1 className="text-2xl font-bold">Close Course</h1>
      </div>

      <WizardProgress />
      <WizardNavigation />
      <WizardContent 
        courseInstance={courseInstance}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
