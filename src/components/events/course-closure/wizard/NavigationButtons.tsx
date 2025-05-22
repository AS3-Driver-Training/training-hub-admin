
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWizardContext } from "./WizardContext";
import { toast } from "sonner";

interface NavigationButtonsProps {
  onSubmit: () => void;
  onUpdate?: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ onSubmit }) => {
  const { 
    currentStep, 
    setCurrentStep, 
    wizardSteps, 
    formData, 
    isSubmitting, 
    file,
    isEditing
  } = useWizardContext();
  
  // Move to next step
  const handleNext = () => {
    // We're no longer requiring file validation since it's optional
    
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
    // We're no longer requiring file validation since it's optional
    
    if (!formData.vehicles?.length) {
      toast("No vehicles added", {
        style: { backgroundColor: "#FEF3C7" },
        description: "Please add at least one vehicle before submitting"
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
          {isSubmitting ? "Submitting..." : isEditing ? "Save Changes" : "Submit Closure"}
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
