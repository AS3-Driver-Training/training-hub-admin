
import React from "react";
import { CourseClosureData } from "@/types/programs";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { useWizardContext } from "../wizard/WizardContext";
import { ReviewHeader } from "./review/ReviewHeader";
import { FileValidationAlert } from "./review/FileValidationAlert";
import { MissingDataAlert } from "./review/MissingDataAlert";
import { CourseBasicInfo } from "./review/CourseBasicInfo";
import { VehiclesTable } from "./review/VehiclesTable";
import { ExercisesTable } from "./review/ExercisesTable";
import { StudentsList } from "./review/StudentsList";
import { NotesCard } from "./review/NotesCard";

interface ReviewStepProps {
  formData: CourseClosureData;
  courseInstance: CourseInstanceWithClient;
  file: File | null;
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function ReviewStep({ formData, courseInstance, file, onJumpToStep }: ReviewStepProps) {
  const { isEditing } = useWizardContext();
  
  console.log("ReviewStep rendering with formData:", formData);
  
  // Ensure we have required arrays to prevent errors
  const vehicles = formData.vehicles || [];
  
  // Handle both camelCase and snake_case versions of additional_exercises
  const additionalExercises = Array.isArray(formData.additionalExercises) 
    ? formData.additionalExercises 
    : (Array.isArray(formData.additional_exercises) 
        ? formData.additional_exercises 
        : []);
  
  console.log("Additional exercises in ReviewStep:", additionalExercises);
  
  // Skip file validation when editing
  if (!file && !isEditing) {
    return <FileValidationAlert onJumpToStep={onJumpToStep} />;
  }
  
  // Safety check - if courseInstance is null or undefined
  if (!courseInstance) {
    return <MissingDataAlert />;
  }
  
  return (
    <div className="space-y-6">
      <ReviewHeader />
      
      <CourseBasicInfo 
        formData={formData} 
        courseInstance={courseInstance} 
        file={file}
        onJumpToStep={onJumpToStep} 
      />
      
      <VehiclesTable 
        vehicles={vehicles} 
        onJumpToStep={onJumpToStep} 
      />
      
      <ExercisesTable 
        courseLayout={formData.course_layout!} 
        additionalExercises={additionalExercises}
        onJumpToStep={onJumpToStep} 
      />
      
      <StudentsList courseInstance={courseInstance} />
      
      <NotesCard notes={formData.notes} />
    </div>
  );
}
