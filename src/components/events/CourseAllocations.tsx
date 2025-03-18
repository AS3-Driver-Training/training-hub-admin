import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  AlertCircle, 
  Plus, 
  Info,
} from "lucide-react";

import { AllocationForm } from "./allocation/AllocationForm";
import { CourseDetailsCards } from "./allocation/CourseDetailsCards"; 
import { CourseInfoCards } from "./allocation/CourseInfoCards";
import { AllocationsTable } from "./allocation/AllocationsTable";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define allocation form schema
const allocationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  seatsAllocated: z.number()
    .min(1, "Must allocate at least one seat")
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

interface Allocation {
  id?: number;
  clientId: string;
  clientName: string;
  seatsAllocated: number;
}

export function CourseAllocations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [remainingSeats, setRemainingSeats] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up form with React Hook Form - using explicit type parameter
  const form = useForm<{clientId: string; seatsAllocated: number;}>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      clientId: "",
      seatsAllocated: 1
    },
  });

  // Fetch course instance details
  const { data: courseInstance, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ["courseInstance", id],
    queryFn: async () => {
      console.log("Fetching course instance with ID:", id);
      const { data, error } = await supabase
        .from("course_instances")
        .select(`
          *,
          program:program_id(
            id,
            name,
            max_students,
            min_students,
            description
          ),
          venue:venue_id(id, name, address, city, state)
        `)
        .eq("id", parseInt(id || '0', 10))
        .single();
      
      if (error) {
        console.error("Error fetching course instance:", error);
        setError(`Failed to load course: ${error.message}`);
        throw error;
      }
      
      console.log("Course instance data:", data);
      return data;
    },
    enabled: !!id,
  });

  // Fetch existing allocations
  const { data: existingAllocations, isLoading: allocationsLoading, error: allocationsError } = useQuery({
    queryKey: ["courseAllocations", id],
    queryFn: async () => {
      console.log("Fetching course allocations for instance ID:", id);
      const { data, error } = await supabase
        .from("course_allocations")
        .select(`
          id,
          seats_allocated,
          client:client_id(
            id,
            name
          )
        `)
        .eq("course_instance_id", parseInt(id || '0', 10));
      
      if (error) {
        console.error("Error fetching allocations:", error);
        setError(`Failed to load allocations: ${error.message}`);
        throw error;
      }
      
      console.log("Allocations data:", data);
      return data;
    },
    enabled: !!id
  });

  // Update allocations state when existing allocations are fetched
  useEffect(() => {
    if (existingAllocations) {
      const formattedAllocations = existingAllocations.map(allocation => ({
        id: allocation.id,
        clientId: allocation.client?.id || '',
        clientName: allocation.client?.name || '',
        seatsAllocated: allocation.seats_allocated
      }));
      
      setAllocations(formattedAllocations);
      updateRemainingSeats(formattedAllocations);
    }
  }, [existingAllocations, courseInstance]);

  // Fetch clients for allocation
  const { data: clients, isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      console.log("Fetching clients");
      const { data, error } = await supabase.from("clients").select("*");
      
      if (error) {
        console.error("Error fetching clients:", error);
        setError(`Failed to load clients: ${error.message}`);
        throw error;
      }
      
      console.log("Clients data:", data);
      return data;
    }
  });

  // Update remaining seats calculation
  const updateRemainingSeats = (currentAllocations: Allocation[]) => {
    if (courseInstance?.program?.max_students) {
      const totalAllocated = currentAllocations.reduce(
        (sum, allocation) => sum + allocation.seatsAllocated, 
        0
      );
      setRemainingSeats(courseInstance.program.max_students - totalAllocated);
    }
  };

  // Save allocations mutation
  const saveAllocationsMutation = useMutation({
    mutationFn: async (allocations: Allocation[]) => {
      console.log("Saving allocations:", allocations);
      
      // Delete all existing allocations
      const { error: deleteError } = await supabase
        .from("course_allocations")
        .delete()
        .eq("course_instance_id", parseInt(id || '0', 10));
      
      if (deleteError) {
        console.error("Error deleting allocations:", deleteError);
        throw deleteError;
      }

      // Insert new allocations
      if (allocations.length > 0) {
        const { error: insertError } = await supabase
          .from("course_allocations")
          .insert(
            allocations.map(a => ({
              course_instance_id: parseInt(id || '0', 10),
              client_id: a.clientId,
              seats_allocated: a.seatsAllocated
            }))
          );
        
        if (insertError) {
          console.error("Error inserting allocations:", insertError);
          throw insertError;
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseAllocations", id] });
      toast({
        title: "Success",
        description: "Seat allocations have been saved successfully",
      });
      navigate("/events");
    },
    onError: (error: any) => {
      console.error("Error in saveAllocationsMutation:", error);
      toast({
        title: "Error",
        description: "Failed to save allocations: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Add a new allocation
  const handleAddAllocation = (values: AllocationFormValues) => {
    // Check if client already has an allocation
    const existingIndex = allocations.findIndex(a => a.clientId === values.clientId);
    
    // Check if there are enough seats left
    if (values.seatsAllocated > remainingSeats) {
      form.setError("seatsAllocated", { 
        type: "max", 
        message: `Cannot allocate more than the remaining ${remainingSeats} seats` 
      });
      return;
    }

    if (existingIndex >= 0) {
      // Update existing allocation
      const updatedAllocations = [...allocations];
      updatedAllocations[existingIndex].seatsAllocated += values.seatsAllocated;
      setAllocations(updatedAllocations);
      updateRemainingSeats(updatedAllocations);
    } else {
      // Add new allocation
      const clientName = clients?.find(c => c.id === values.clientId)?.name || '';
      const newAllocations = [
        ...allocations,
        {
          clientId: values.clientId,
          clientName,
          seatsAllocated: values.seatsAllocated
        }
      ];
      setAllocations(newAllocations);
      updateRemainingSeats(newAllocations);
    }

    // Reset form and hide it
    form.reset();
    setShowAddForm(false);
    
    toast({
      title: "Allocation Added",
      description: "The seat allocation has been added successfully.",
    });
  };

  // Remove an allocation
  const handleRemoveAllocation = (index: number) => {
    const clientName = allocations[index].clientName;
    const seatsAllocated = allocations[index].seatsAllocated;
    
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
    updateRemainingSeats(newAllocations);
    
    toast({
      title: "Allocation Removed",
      description: `Removed ${seatsAllocated} seats for ${clientName}.`,
    });
  };

  // Save all allocations
  const handleSaveAllocations = () => {
    if (allocations.length === 0) {
      toast({
        title: "Warning",
        description: "There are no seat allocations to save",
      });
      return;
    }
    
    saveAllocationsMutation.mutate(allocations);
  };

  // Loading state
  if (courseLoading || allocationsLoading || clientsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || courseError || allocationsError || clientsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || (courseError as Error)?.message || (allocationsError as Error)?.message || (clientsError as Error)?.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/events")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
        </Button>
      </div>
    );
  }

  // Calculate total allocated seats
  const totalAllocated = allocations.reduce(
    (sum, allocation) => sum + allocation.seatsAllocated, 
    0
  );
  
  // Calculate allocation percentage
  const maxStudents = courseInstance?.program?.max_students || 0;
  const allocationPercentage = maxStudents > 0 ? (totalAllocated / maxStudents) * 100 : 0;

  // Get filtered clients (exclude already allocated ones unless updating)
  const availableClients = clients?.filter(client => 
    !allocations.some(a => a.clientId === client.id) || 
    form.getValues("clientId") === client.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with back button */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/events")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Course Details
          </h1>
        </div>
        <p className="text-muted-foreground">
          {courseInstance?.start_date && format(new Date(courseInstance.start_date), "MMMM d, yyyy")} - 
          {courseInstance?.end_date && format(new Date(courseInstance.end_date), " MMMM d, yyyy")}
        </p>
      </div>

      {/* Course Details Cards */}
      <CourseDetailsCards 
        courseInstance={courseInstance}
        remainingSeats={remainingSeats}
        maxStudents={maxStudents}
        allocationPercentage={allocationPercentage}
      />

      {/* Program Details & Location Details */}
      <CourseInfoCards courseInstance={courseInstance} />

      {/* Enrolled Students / Seat Allocations Section */}
      <Card className="border shadow-sm mb-8">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Seat Allocations</CardTitle>
              <CardDescription>Assign available seats to clients for this course</CardDescription>
            </div>
            
            {remainingSeats > 0 && !showAddForm && (
              <Button 
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign Seats
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Add Allocation Form */}
          {showAddForm && (
            <AllocationForm 
              form={form}
              onSubmit={handleAddAllocation}
              onCancel={() => {
                form.reset();
                setShowAddForm(false);
              }}
              availableClients={availableClients}
              remainingSeats={remainingSeats}
            />
          )}

          {/* Allocations Table */}
          <AllocationsTable 
            allocations={allocations}
            onRemoveAllocation={handleRemoveAllocation}
            showAddForm={showAddForm}
            remainingSeats={remainingSeats}
            setShowAddForm={setShowAddForm}
          />

          {allocations.length > 0 && remainingSeats === 0 && (
            <Alert className="mt-4 bg-emerald-50 text-emerald-800 border-emerald-200">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="font-medium text-emerald-800">
                All available seats have been allocated.
              </AlertDescription>
            </Alert>
          )}

          {allocations.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-2" />
                <span>Total {totalAllocated} of {maxStudents} seats allocated</span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/events")}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAllocations}
                  disabled={allocations.length === 0}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Save Allocations
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
