
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { WizardStep, useWizardContext } from "./WizardContext";

export const WizardNavigation: React.FC = () => {
  const { currentStep, wizardSteps, jumpToStep } = useWizardContext();
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {wizardSteps
        .filter(step => step.key !== 'completed' || currentStep === 'completed')
        .map((step, index) => (
          <Button
            key={step.key}
            variant={currentStep === step.key ? "default" : "outline"}
            className="flex items-center gap-1"
            onClick={() => currentStep !== 'completed' && jumpToStep(step.key)}
            disabled={currentStep === 'completed' && step.key !== 'completed'}
          >
            <span className="flex items-center justify-center rounded-full h-6 w-6 bg-muted text-xs mr-1">
              {index + 1}
            </span>
            {step.title}
            {currentStep === step.key && <Check className="ml-1 h-4 w-4" />}
          </Button>
        ))}
    </div>
  );
};

export const WizardProgress: React.FC = () => {
  const { currentStep, getProgress } = useWizardContext();
  
  if (currentStep === 'completed') {
    return null;
  }
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${getProgress()}%` }}
      ></div>
    </div>
  );
};
