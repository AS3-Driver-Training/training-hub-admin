import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramsTable } from "@/components/programs/ProgramsTable";
import { CreateProgramDialog } from "@/components/programs/CreateProgramDialog";
import { Program } from "@/types/programs";
import { useToast } from "@/hooks/use-toast";

// Mock API call to get programs
const fetchPrograms = async (): Promise<Program[]> => {
  // In a real app, this would be an API call
  return [
    {
      id: "1",
      name: "Advanced Leadership Training",
      sku: "ALT-001",
      description: "A comprehensive leadership training program for managers",
      durationDays: 5,
      maxStudents: 20,
      minStudents: 5,
      price: 1500,
      lvl: "Advanced",
    },
    {
      id: "2",
      name: "Basic Project Management",
      sku: "BPM-100",
      description: "Introduction to project management methodologies",
      durationDays: 3,
      maxStudents: 30,
      minStudents: 10,
      price: 800,
      lvl: "Basic",
    },
    {
      id: "3",
      name: "Team Collaboration Workshop",
      sku: "TCW-201",
      description: "Interactive workshop focusing on team collaboration techniques",
      durationDays: 2,
      maxStudents: 25,
      minStudents: 8,
      price: 600,
      lvl: "Intermediate",
    },
  ];
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

  const handleDeleteProgram = (programId: string) => {
    // In a real app, this would call an API
    toast({
      title: "Program deleted",
      description: "The program has been successfully deleted.",
    });
    refetch();
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
      />
    </div>
  );
}
