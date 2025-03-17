
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramsTable } from "@/components/programs/ProgramsTable";
import { CreateProgramDialog } from "@/components/programs/CreateProgramDialog";
import { Program } from "@/types/programs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch programs from Supabase
const fetchPrograms = async (): Promise<Program[]> => {
  const { data, error } = await supabase
    .from('programs')
    .select('*');
  
  if (error) {
    console.error("Error fetching programs:", error);
    throw new Error("Failed to fetch programs");
  }
  
  // Transform the data to match our frontend model
  return (data || []).map(program => ({
    id: program.id.toString(),
    name: program.name,
    sku: program.sku,
    description: program.description || "",
    durationDays: program.duration_days || 0,
    maxStudents: program.max_students || 0,
    minStudents: program.min_students || 0,
    price: program.price || 0,
    lvl: getLevelString(program.lvl),
  }));
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
    setProgramToEdit(program);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteProgram = async (programId: string) => {
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', parseInt(programId));
      
      if (error) throw error;
      
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
