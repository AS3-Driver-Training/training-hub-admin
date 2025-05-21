
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { WizardStep, useWizardContext } from "./WizardContext";
import { cn } from "@/lib/utils";

export const WizardNavigation: React.FC = () => {
  const { currentStep, wizardSteps, jumpToStep } = useWizardContext();
  
  return (
    <Tabs value={currentStep} className="w-full mb-6">
      <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
        {wizardSteps
          .filter(step => step.key !== 'completed' || currentStep === 'completed')
          .map((step, index) => (
            <TabsTrigger
              key={step.key}
              value={step.key}
              onClick={() => currentStep !== 'completed' && jumpToStep(step.key)}
              disabled={currentStep === 'completed' && step.key !== 'completed'}
              className={cn(
                "flex items-center gap-2 border-b-2 rounded-none px-4 py-2",
                "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                "data-[state=active]:text-primary data-[state=active]:shadow-none",
                "transition-all duration-200",
                currentStep === step.key 
                  ? "border-primary text-primary font-medium" 
                  : "border-transparent text-muted-foreground"
              )}
            >
              <span className={cn(
                "flex items-center justify-center rounded-full h-6 w-6 text-xs",
                currentStep === step.key 
                  ? "bg-primary text-white" 
                  : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              {step.title}
              {currentStep === step.key && <Check className="ml-1 h-4 w-4" />}
            </TabsTrigger>
          ))}
      </TabsList>
    </Tabs>
  );
};

export const WizardProgress: React.FC = () => {
  const { currentStep, getProgress } = useWizardContext();
  
  if (currentStep === 'completed') {
    return null;
  }
  
  return (
    <div className="w-full bg-muted rounded-full h-2.5 mb-4">
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${getProgress()}%` }}
      ></div>
    </div>
  );
};
