
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWizardContext } from "../WizardContext";
import { apiTransformer } from "@/utils/dataTransformUtils";
import { toast } from "sonner";
import { format } from "date-fns";

/**
 * Hook to check for and load existing course closures
 */
export const useExistingClosure = (courseId?: number) => {
  const { 
    formData, 
    updateFormData, 
    setCurrentStep, 
    setCompletedClosureId, 
    setIsEditing 
  } = useWizardContext();
  
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

  // Handle any existing closure data to initialize form state
  const handleExistingClosureData = async () => {
    if (!existingClosure) return;
    
    console.log("Found existing closure:", existingClosure);
    setCurrentStep('completed');
    setCompletedClosureId(existingClosure.id);
    
    // Initialize formData with existing closure details
    const baseFormData = {
      course_info: {
        units: existingClosure.units || "MPH",
        country: existingClosure.country || "USA",
        program: formData.course_info?.program || "",
        date: formData.course_info?.date || "",
        client: formData.course_info?.client || ""
      },
      vehicles: [],
      additional_exercises: [], // Use snake_case to match type definition
      course_layout: formData.course_layout // Initialize with default layout
    };

    // Try to load closure data from the closure_data JSON field
    if (existingClosure.closure_data) {
      try {
        console.log("Raw closure data from DB:", existingClosure.closure_data);
        console.log("Type of closure_data:", typeof existingClosure.closure_data);
        
        // Parse JSON string if needed - crucial fix!
        let parsedData: any;
        if (typeof existingClosure.closure_data === 'string') {
          try {
            parsedData = JSON.parse(existingClosure.closure_data);
            console.log("Successfully parsed closure_data JSON string");
          } catch (parseErr) {
            console.error("Failed to parse closure_data as JSON string:", parseErr);
            // If we can't parse it, use as-is and let the transformer handle it
            parsedData = existingClosure.closure_data;
          }
        } else {
          // Already an object
          parsedData = existingClosure.closure_data;
        }
        
        // Apply to formData including any vehicle data and additional_exercises
        const transformedData = apiTransformer.fromApi(parsedData);
        
        console.log("Transformed data after fromApi:", transformedData);
        
        // Ensure vehicles array exists
        if (!transformedData.vehicles) {
          transformedData.vehicles = [];
        }
        
        // Ensure additional_exercises array exists - crucial fix!
        if (!transformedData.additional_exercises) {
          transformedData.additional_exercises = [];
          
          // Look for additionalExercises in the data (camelCase)
          if (transformedData.additionalExercises && Array.isArray(transformedData.additionalExercises)) {
            console.log("Found additionalExercises in transformedData:", transformedData.additionalExercises);
            transformedData.additional_exercises = transformedData.additionalExercises;
          }
          
          // Also check the original data (snake_case)
          else if (parsedData.additional_exercises && Array.isArray(parsedData.additional_exercises)) {
            console.log("Found additional_exercises in parsedData:", parsedData.additional_exercises);
            transformedData.additional_exercises = parsedData.additional_exercises.map((exercise: any) => {
              return {
                id: exercise.id,
                name: exercise.name,
                isMeasured: exercise.is_measured !== undefined ? exercise.is_measured : false,
                measurementType: exercise.measurement_type || 'time',
                parameters: exercise.parameters || {}
              };
            });
          }
        }
        
        // Ensure course_layout exists
        if (!transformedData.course_layout) {
          transformedData.course_layout = formData.course_layout;
        }
        
        // Special handling for nested properties to ensure proper case conversion
        if (Array.isArray(transformedData.vehicles)) {
          transformedData.vehicles = transformedData.vehicles.map(vehicle => ({
            ...vehicle,
            // Ensure latAcc property is correctly mapped from snake_case
            latAcc: vehicle.latAcc !== undefined ? vehicle.latAcc : 
                    (vehicle.lat_acc !== undefined ? vehicle.lat_acc : undefined)
          }));
        }
        
        if (Array.isArray(transformedData.additional_exercises)) {
          transformedData.additional_exercises = transformedData.additional_exercises.map(exercise => ({
            ...exercise,
            // Ensure isMeasured property is correctly mapped
            isMeasured: exercise.isMeasured !== undefined ? exercise.isMeasured : 
                       (exercise.is_measured !== undefined ? exercise.is_measured : false),
            // Ensure measurementType property is correctly mapped
            measurementType: exercise.measurementType || exercise.measurement_type || 'time'
          }));
        }
        
        const finalFormData = {...baseFormData, ...transformedData};
        console.log("Final form data with exercises:", finalFormData);
        updateFormData(finalFormData);
        return;
      } catch (e) {
        console.error("Failed to process closure_data:", e);
        toast.error("Failed to load course closure data");
      }
    }
    
    // If closure_data wasn't available, try to load vehicles from course_vehicles table
    const loadVehicles = async () => {
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('course_vehicles')
        .select(`
          *,
          vehicle:vehicle_id(
            id,
            make,
            model,
            year,
            latacc
          )
        `)
        .eq('course_instance_id', courseId);
        
      if (!vehiclesError && vehiclesData && vehiclesData.length > 0) {
        // Transform vehicle data to the format expected by the form
        const formattedVehicles = vehiclesData.map(v => ({
          car: v.car_number,
          make: v.vehicle?.make || "",
          model: v.vehicle?.model,
          year: v.vehicle?.year,
          latAcc: v.vehicle?.latacc // Map latacc to latAcc
        }));
        
        // Add vehicles to form data
        updateFormData({
          ...baseFormData,
          vehicles: formattedVehicles
        });
        
        console.log("Loaded vehicles from course_vehicles table:", formattedVehicles);
      } else {
        // Just use the base form data
        updateFormData(baseFormData);
      }
    };
    
    loadVehicles();
  };

  return { existingClosure, handleExistingClosureData };
};
