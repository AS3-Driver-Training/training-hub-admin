
import React, { createContext, useContext, useState, ReactNode } from "react";
import { CourseClosureData } from "@/types/programs";

export type WizardStep = 'basic' | 'vehicles' | 'exercises' | 'review' | 'completed';

export interface WizardStepInfo {
  key: WizardStep;
  title: string;
  description: string;
}

export interface WizardContextProps {
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  formData: Partial<CourseClosureData>;
  updateFormData: (stepData: Partial<CourseClosureData>) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  completedClosureId: number | null;
  setCompletedClosureId: (id: number | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  wizardSteps: WizardStepInfo[];
  courseId?: number;
  jumpToStep: (step: WizardStep) => void;
  getProgress: () => number;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const WizardContext = createContext<WizardContextProps | undefined>(undefined);

export const useWizardContext = (): WizardContextProps => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardContext must be used within a WizardProvider");
  }
  return context;
};

interface WizardProviderProps {
  children: ReactNode;
  courseId?: number;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children, courseId }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [completedClosureId, setCompletedClosureId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CourseClosureData>>({
    course_info: {
      units: "MPH",
      country: "USA",
      program: "",
      date: "",
      client: ""
    },
    vehicles: [],
    course_layout: {
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
    students: [],
    additional_exercises: []
  });

  // Define wizard steps
  const wizardSteps: WizardStepInfo[] = [
    { key: 'basic', title: 'Basic Information', description: 'Course details and settings' },
    { key: 'vehicles', title: 'Vehicles', description: 'Add vehicles used in the course' },
    { key: 'exercises', title: 'Exercises', description: 'Configure exercise parameters' },
    { key: 'review', title: 'Review & Submit', description: 'Confirm and finalize' },
    { key: 'completed', title: 'Completed', description: 'Course has been closed' }
  ];

  const updateFormData = (stepData: Partial<CourseClosureData>) => {
    console.log("Updating form data with:", stepData);
    setFormData(prevData => ({
      ...prevData,
      ...stepData
    }));
  };

  // Move to a specific step
  const jumpToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  // Get progress percentage
  const getProgress = () => {
    const currentIndex = wizardSteps.findIndex(step => step.key === currentStep);
    // Filter out the completed step for progress calculation
    const totalSteps = wizardSteps.filter(step => step.key !== 'completed').length;
    return Math.floor(((currentIndex + 1) / totalSteps) * 100);
  };

  return (
    <WizardContext.Provider value={{
      currentStep,
      setCurrentStep,
      formData,
      updateFormData,
      file,
      setFile,
      completedClosureId,
      setCompletedClosureId,
      isSubmitting,
      setIsSubmitting,
      wizardSteps,
      courseId,
      jumpToStep,
      getProgress,
      isEditing,
      setIsEditing
    }}>
      {children}
    </WizardContext.Provider>
  );
};
