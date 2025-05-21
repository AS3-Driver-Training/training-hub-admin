
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WizardStep, useWizardContext } from "./WizardContext";
import { toast } from "@/utils/toast";

interface NavigationButtonsProps {
  onSubmit: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ onSubmit }) => {
  const { currentStep, setCurrentStep, wizardSteps, formData, isSubmitting, file } = useWizardContext();
  
  // Move to next step
  const handleNext = () => {
    if (currentStep === 'basic' && !file) {
      toast({
        title: "Missing course data",
        description: "Please upload the course data ZIP file before continuing",
        variant: "destructive"
      });
      return;
    }
    
    const currentIndex = wizardSteps.findIndex(step => step.key === currentStep);
    if (currentIndex < wizardSteps.length - 1) {
      setCurrentStep(wizardSteps[currentIndex + 1].key);
    }
  };

  // Move to previous step
  const handlePrevious = () => {
    const currentIndex = wizardSteps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(wizardSteps[currentIndex - 1].key);
    }
  };

  // Handle submission
  const handleSubmit = () => {
    if (!file) {
      toast({
        title: "Missing course data",
        description: "Please upload the course data ZIP file before submitting",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.vehicles?.length) {
      toast({
        title: "No vehicles added",
        description: "Please add at least one vehicle before submitting",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit();
  };

  if (currentStep === 'completed') {
    return null;
  }

  return (
    <div className="mt-6 flex justify-between border-t pt-4">
      {currentStep !== 'basic' ? (
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
      ) : (
        <div></div>
      )}

      {currentStep === 'review' ? (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? "Submitting..." : "Submit Closure"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleNext}
          className="gap-1 bg-primary hover:bg-primary/90"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
