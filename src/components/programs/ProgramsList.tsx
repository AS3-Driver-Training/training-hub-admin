
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramsTable } from "@/components/programs/ProgramsTable";
import { CreateProgramDialog } from "@/components/programs/CreateProgramDialog";
import { Program, ProgramExercise, ExerciseParameter } from "@/types/programs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch programs from Supabase
const fetchPrograms = async (): Promise<Program[]> => {
  // Fetch programs
  const { data: programsData, error: programsError } = await supabase
    .from('programs')
    .select('*');
  
  if (programsError) {
    console.error("Error fetching programs:", programsError);
    throw new Error("Failed to fetch programs");
  }
  
  // Transform the programs data
  const programs = (programsData || []).map(program => ({
    id: program.id.toString(),
    name: program.name,
    sku: program.sku,
    description: program.description || "",
    durationDays: program.duration_days || 0,
    maxStudents: program.max_students || 0,
    minStudents: program.min_students || 0,
    price: program.price || 0,
    lvl: getLevelString(program.lvl),
    measured: program.measured || false,
    exercises: [], // Will be populated below
  }));

  // Fetch exercises for all programs
  for (const program of programs) {
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('program_exercises')
      .select('*')
      .eq('program_id', parseInt(program.id));
    
    if (exercisesError) {
      console.error(`Error fetching exercises for program ${program.id}:`, exercisesError);
      continue;
    }

    // Transform exercises data
    const exercises: ProgramExercise[] = (exercisesData || []).map(exercise => ({
      id: exercise.id.toString(),
      name: exercise.name,
      isCore: exercise.is_core,
      isMeasured: exercise.is_measured,
      measurementType: exercise.measurement_type as 'latacc' | 'time',
      order: exercise.order,
      parameters: [],
    }));

    // Fetch parameters for each exercise
    for (const exercise of exercises) {
      const { data: parametersData, error: parametersError } = await supabase
        .from('exercise_parameters')
        .select('*')
        .eq('exercise_id', parseInt(exercise.id));
      
      if (parametersError) {
        console.error(`Error fetching parameters for exercise ${exercise.id}:`, parametersError);
        continue;
      }

      // Transform parameters data
      exercise.parameters = (parametersData || []).map(param => ({
        id: param.id.toString(),
        name: param.parameter_name,
        value: param.parameter_value,
      }));
    }

    program.exercises = exercises;
  }
  
  return programs;
};

// Helper function to convert numeric level to string representation
const getLevelString = (level?: number): string => {
  switch(level) {
    case 1: return "Basic";
    case 2: return "Intermediate";
    case 3: return "Advanced";
    default: return "Basic";
  }
};

// Helper function to convert string level to numeric representation
const getLevelNumber = (level: string): number => {
  switch(level) {
    case "Basic": return 1;
    case "Intermediate": return 2;
    case "Advanced": return 3;
    default: return 1;
  }
};

export function ProgramsList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
  const { toast } = useToast();

  const { data: programs, isLoading, refetch } = useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
  });

  const handleCreateProgram = () => {
    setIsCreateDialogOpen(true);
    setProgramToEdit(null);
  };

  const handleEditProgram = (program: Program) => {
    console.log("Editing program:", program);
    setProgramToEdit(program);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteProgram = async (programId: string) => {
    try {
      // First, delete related exercises (cascade will handle parameters)
      const { error: exercisesError } = await supabase
        .from('program_exercises')
        .delete()
        .eq('program_id', parseInt(programId));
      
      if (exercisesError) throw exercisesError;
      
      // Then delete the program
      const { error: programError } = await supabase
        .from('programs')
        .delete()
        .eq('id', parseInt(programId));
      
      if (programError) throw programError;
      
      toast({
        title: "Program deleted",
        description: "The program has been successfully deleted.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Error",
        description: "Failed to delete program. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = (success?: boolean) => {
    setIsCreateDialogOpen(false);
    setProgramToEdit(null);
    if (success) {
      refetch();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Programs Management</h1>
        <Button onClick={handleCreateProgram}>
          <Plus className="mr-2 h-4 w-4" />
          Create Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading programs...</p>
          ) : (
            <ProgramsTable 
              programs={programs || []} 
              onEdit={handleEditProgram}
              onDelete={handleDeleteProgram}
            />
          )}
        </CardContent>
      </Card>

      <CreateProgramDialog
        open={isCreateDialogOpen}
        onClose={handleDialogClose}
        program={programToEdit}
        getLevelNumber={getLevelNumber}
      />
    </div>
  );
}
