
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Save, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast, success, error as toastError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingDisplay } from "../allocation/LoadingDisplay";
import { ErrorDisplay } from "../allocation/ErrorDisplay";
import { CourseClosureData } from "@/types/programs";
import { apiTransformer } from "@/utils/dataTransformUtils";

import { BasicInfoStep } from "./steps/BasicInfoStep";
import { VehiclesStep } from "./steps/VehiclesStep";
import { ExercisesStep } from "./steps/ExercisesStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CompletedView } from "./steps/CompletedView";

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

type WizardStep = 'basic' | 'vehicles' | 'exercises' | 'review' | 'completed';

interface WizardStepInfo {
  key: WizardStep;
  title: string;
  description: string;
}

export function CourseClosureWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id) : undefined;
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
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
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [completedClosureId, setCompletedClosureId] = useState<number | null>(null);

  // Define wizard steps
  const wizardSteps: WizardStepInfo[] = [
    { key: 'basic', title: 'Basic Information', description: 'Course details and settings' },
    { key: 'vehicles', title: 'Vehicles', description: 'Add vehicles used in the course' },
    { key: 'exercises', title: 'Exercises', description: 'Configure exercise parameters' },
    { key: 'review', title: 'Review & Submit', description: 'Confirm and finalize' },
    { key: 'completed', title: 'Completed', description: 'Course has been closed' }
  ];

  // Fetch course details
  const { data: courseInstance, isLoading, error } = useQuery({
    queryKey: ["course-instance", courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await supabase
        .from("course_instances")
        .select(`
          id, 
          start_date, 
          end_date,
          programs:program_id(id, name),
          venues:venue_id(id, name),
          host_client_id
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      
      // Create our response with the correct type
      const responseWithClient: CourseInstanceWithClient = { ...data };
      
      // Fetch client info if host_client_id exists
      if (data.host_client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("name")
          .eq("id", data.host_client_id)
          .single();
        
        if (!clientError && clientData) {
          responseWithClient.clientName = clientData.name;
        }
      }
      
      // Fetch venue country information
      if (data.venues && data.venues.id) {
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("region")
          .eq("id", data.venues.id)
          .single();
          
        if (!venueError && venueData && venueData.region) {
          responseWithClient.venues.country = venueData.region;
        }
      }
      
      return responseWithClient;
    },
    enabled: !!courseId,
  });

  // Initialize form data when course instance is loaded
  useEffect(() => {
    if (courseInstance) {
      const courseDate = new Date(courseInstance.start_date);
      
      setFormData(prev => ({
        ...prev,
        course_info: {
          ...prev.course_info!,
          program: courseInstance.programs?.name || "Unknown Program",
          date: format(courseDate, "yyyy-MM-dd"),
          client: courseInstance.clientName || "Unknown Client",
          country: courseInstance.venues?.country || "USA"
        }
      }));
    }
  }, [courseInstance]);

  // Check for existing closure
  const { data: existingClosure } = useQuery({
    queryKey: ["existing-closure", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from("course_closures")
        .select("*")
        .eq("course_instance_id", courseId)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) throw error;
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!courseId
  });

  // Set to completed step if there's already a closure
  useEffect(() => {
    if (existingClosure) {
      setCurrentStep('completed');
      setCompletedClosureId(existingClosure.id);
      
      // Initialize formData with existing closure details
      const baseFormData: Partial<CourseClosureData> = {
        course_info: {
          units: existingClosure.units || "MPH",
          country: existingClosure.country || "USA",
          program: formData.course_info?.program || "",
          date: formData.course_info?.date || "",
          client: formData.course_info?.client || ""
        }
      };

      // Try to load any additional JSON data that might be stored as a stringified object
      try {
        // Check if there's a JSON string property that could contain the full data
        for (const key of Object.keys(existingClosure)) {
          if (typeof existingClosure[key] === 'string' && 
              existingClosure[key].startsWith('{') && 
              existingClosure[key].endsWith('}')) {
            try {
              const parsedData = JSON.parse(existingClosure[key]);
              if (parsedData && typeof parsedData === 'object') {
                // Apply to formData
                setFormData({...baseFormData, ...apiTransformer.fromApi(parsedData)});
                return;
              }
            } catch (e) {
              // Not valid JSON, continue checking other properties
              console.error("Failed to parse potential JSON data:", e);
            }
          }
        }
      } catch (e) {
        console.error("Error processing closure data:", e);
      }
      
      // If no JSON data found, just use the base form data
      setFormData(baseFormData);
    }
  }, [existingClosure]);

  // Submit closure data
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) throw new Error("No course ID provided");
      setIsSubmitting(true);
      
      let zipfileUrl = null;
      let closureDataJson = null;
      
      try {
        // Convert formData to proper CourseClosureData
        const closureData: CourseClosureData = formData as CourseClosureData;
        closureDataJson = JSON.stringify(apiTransformer.toApi(closureData));
        
        // Handle file upload if a file is selected
        if (file) {
          // Upload file to storage
          const timestamp = Date.now();
          const fileExt = file.name.split('.').pop();
          const fileName = `course-${courseId}-${timestamp}.${fileExt}`;
          const filePath = `course-closures/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("course-documents")
            .upload(filePath, file);
          
          if (uploadError) {
            throw new Error(`File upload failed: ${uploadError.message}`);
          }
          
          // Get the URL for the uploaded file
          const { data: urlData } = await supabase.storage
            .from("course-documents")
            .getPublicUrl(filePath);
            
          zipfileUrl = urlData.publicUrl;
        }
        
        // Create the record payload
        const payload = {
          course_instance_id: courseId,
          status: "draft",
          units: formData.course_info?.units,
          country: formData.course_info?.country,
          zipfile_url: zipfileUrl,
          closed_by: "00000000-0000-0000-0000-000000000000" // Placeholder UUID, should be replaced with actual user ID
        };

        // Add closure_data JSON if available - this will only work if there's a column for it
        if (closureDataJson) {
          try {
            // Check if closure_data column exists (this will only run once)
            const { data: columnsData } = await supabase
              .from('course_closures')
              .select('*')
              .limit(1);
              
            if (columnsData && columnsData[0] && 'closure_data' in columnsData[0]) {
              // If the column exists, include it in the payload
              Object.assign(payload, { closure_data: closureDataJson });
            }
          } catch (e) {
            console.error("Error checking for closure_data column:", e);
          }
        }
        
        // Create course closure record
        const { data, error } = await supabase
          .from("course_closures")
          .insert(payload)
          .select();
          
        if (error) throw error;
        setCompletedClosureId(data[0].id);
        return data;
      } catch (err) {
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      success("Course closure process completed successfully");
      setCurrentStep('completed');
    },
    onError: (err: any) => {
      toastError(`Error: ${err.message}`);
    },
  });

  // Update form data
  const updateFormData = (stepData: Partial<CourseClosureData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData
    }));
  };

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  // Move to next step
  const handleNext = () => {
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

  // Jump to a specific step
  const jumpToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  // Handle submission
  const handleSubmit = () => {
    if (formData.vehicles?.length === 0) {
      toast({
        title: "No vehicles added",
        description: "Please add at least one vehicle before submitting",
        variant: "destructive"
      });
      return;
    }
    
    submitMutation.mutate();
  };

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

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicInfoStep 
            courseInstance={courseInstance} 
            formData={formData} 
            onUpdate={updateFormData}
            onFileChange={handleFileChange}
            file={file}
          />
        );
      case 'vehicles':
        return (
          <VehiclesStep 
            formData={formData} 
            onUpdate={updateFormData}
          />
        );
      case 'exercises':
        return (
          <ExercisesStep 
            formData={formData} 
            onUpdate={updateFormData}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            formData={formData as CourseClosureData}
            courseInstance={courseInstance}
            file={file}
            onJumpToStep={jumpToStep}
          />
        );
      case 'completed':
        return (
          <CompletedView 
            formData={formData as CourseClosureData}
            courseId={courseId!}
            closureId={completedClosureId}
            onEdit={() => setCurrentStep('review')}
          />
        );
      default:
        return null;
    }
  };
  
  // Get progress percentage
  const getProgress = () => {
    const currentIndex = wizardSteps.findIndex(step => step.key === currentStep);
    // Filter out the completed step for progress calculation
    const totalSteps = wizardSteps.filter(step => step.key !== 'completed').length;
    return Math.floor(((currentIndex + 1) / totalSteps) * 100);
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

      {/* Progress Bar */}
      {currentStep !== 'completed' && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
      )}

      {/* Wizard Navigation */}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {wizardSteps.find(step => step.key === currentStep)?.title || "Course Closure"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}

              {/* Navigation buttons */}
              {currentStep !== 'completed' && (
                <div className="mt-6 flex justify-between border-t pt-4">
                  {currentStep !== 'basic' ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
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
                    >
                      {isSubmitting ? "Submitting..." : "Submit Closure"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleNext}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About {wizardSteps.find(step => step.key === currentStep)?.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                {currentStep === 'basic' && 
                  "Enter the basic information about the course closure. Some fields are auto-populated from course details."}
                {currentStep === 'vehicles' && 
                  "Add all vehicles used during the course. You can search for existing vehicles or add new ones."}
                {currentStep === 'exercises' && 
                  "Configure parameters for all exercises used in the course, including core exercises and any additional ones."}
                {currentStep === 'review' && 
                  "Review all information before finalizing the course closure. You can go back to any section to make changes."}
                {currentStep === 'completed' && 
                  "The course has been closed successfully. You can still make edits if needed."}
              </p>
              
              {currentStep === 'basic' && (
                <Alert>
                  <AlertDescription>
                    Country information is automatically pulled from the venue data to ensure consistency.
                  </AlertDescription>
                </Alert>
              )}
              
              {currentStep === 'vehicles' && (
                <Alert>
                  <AlertDescription>
                    Each vehicle requires make, model, and lateral acceleration value. Consider using the search feature to avoid duplication.
                  </AlertDescription>
                </Alert>
              )}
              
              {currentStep === 'exercises' && (
                <Alert>
                  <AlertDescription>
                    Parameters for the Final Exercise will auto-copy from the standalone exercises but can be adjusted separately.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

