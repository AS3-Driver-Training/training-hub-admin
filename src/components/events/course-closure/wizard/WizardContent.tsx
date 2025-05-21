
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWizardContext } from "./WizardContext";
import { NavigationButtons } from "./NavigationButtons";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { BasicInfoStep } from "../steps/BasicInfoStep";
import { VehiclesStep } from "../steps/VehiclesStep";
import { ExercisesStep } from "../steps/ExercisesStep";
import { ReviewStep } from "../steps/ReviewStep";
import { CompletedView } from "../steps/CompletedView";
import { CourseClosureData } from "@/types/programs";
import { Info } from "lucide-react";

interface WizardContentProps {
  courseInstance: CourseInstanceWithClient;
  onSubmit: () => void;
}

export const WizardContent: React.FC<WizardContentProps> = ({ courseInstance, onSubmit }) => {
  const { currentStep, wizardSteps, formData, updateFormData, file, setFile, completedClosureId, jumpToStep, courseId } = useWizardContext();

  // Ensure formData is treated as CourseClosureData with guaranteed required fields
  const safeFormData: CourseClosureData = {
    course_info: formData.course_info || {
      units: "MPH",
      country: "USA",
      program: "",
      date: "",
      client: ""
    },
    vehicles: formData.vehicles || [],
    course_layout: formData.course_layout || {
      slalom: { chord: 100, mo: 15 },
      lane_change: { chord: 120, mo: 20 },
      final_exercise: {
        ideal_time_sec: 70,
        cone_penalty_sec: 3,
        door_penalty_sec: 5,
        slalom: { chord: 100, mo: 15 },
        lane_change: { chord: 120, mo: 20 }
      }
    },
    notes: formData.notes
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicInfoStep 
            courseInstance={courseInstance} 
            formData={safeFormData} 
            onUpdate={updateFormData}
            onFileChange={setFile}
            file={file}
          />
        );
      case 'vehicles':
        return (
          <VehiclesStep 
            formData={safeFormData} 
            onUpdate={updateFormData}
          />
        );
      case 'exercises':
        return (
          <ExercisesStep 
            formData={safeFormData} 
            onUpdate={updateFormData}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            formData={safeFormData}
            courseInstance={courseInstance}
            file={file}
            onJumpToStep={jumpToStep}
          />
        );
      case 'completed':
        return (
          <CompletedView 
            formData={safeFormData}
            courseId={courseId!}
            closureId={completedClosureId}
            onEdit={() => jumpToStep('review')}
          />
        );
      default:
        return null;
    }
  };

  // Render help text for the current step
  const renderHelpText = () => {
    switch (currentStep) {
      case 'basic':
        return "Enter the basic information about the course closure. Some fields are auto-populated from course details.";
      case 'vehicles':
        return "Add all vehicles used during the course. You can search for existing vehicles or add new ones.";
      case 'exercises':
        return "Configure parameters for all exercises used in the course, including core exercises and any additional ones.";
      case 'review':
        return "Review all information before finalizing the course closure. You can go back to any section to make changes.";
      case 'completed':
        return "The course has been closed successfully. You can still make edits if needed.";
      default:
        return "";
    }
  };

  const currentStepInfo = wizardSteps.find(step => step.key === currentStep);

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {currentStepInfo?.title || "Course Closure"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep !== 'vehicles' && (
            <div className="mb-4">
              <Alert className="bg-transparent border-0 p-0 flex items-center">
                <Info className="h-4 w-4 text-primary mr-2" />
                <AlertDescription className="text-sm text-muted-foreground">
                  {renderHelpText()}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {renderStepContent()}
          <NavigationButtons onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </div>
  );
};
