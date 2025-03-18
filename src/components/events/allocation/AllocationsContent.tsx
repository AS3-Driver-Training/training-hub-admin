
import { AlertCircle, Info, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { AllocationForm } from "./AllocationForm";
import { AllocationsTable } from "./AllocationsTable";

// Define allocation form schema
const allocationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  seatsAllocated: z.number()
    .min(1, "Must allocate at least one seat")
});

interface AllocationsContentProps {
  allocations: any[];
  remainingSeats: number;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  handleAddAllocation: (values: {clientId: string; seatsAllocated: number;}, clients: any[]) => {success?: boolean; error?: string};
  handleRemoveAllocation: (index: number) => void;
  totalAllocated: number;
  maxStudents: number;
  saveAllocationsMutation: any;
  clients: any[] | undefined;
  courseInstance: any;
}

export function AllocationsContent({
  allocations,
  remainingSeats,
  showAddForm,
  setShowAddForm,
  handleAddAllocation,
  handleRemoveAllocation,
  totalAllocated,
  maxStudents,
  saveAllocationsMutation,
  clients,
  courseInstance
}: AllocationsContentProps) {
  const navigate = useNavigate();
  const isPrivateCourse = courseInstance && !courseInstance.is_open_enrollment;
  
  // Set up form with React Hook Form - using explicit type parameter
  const form = useForm<{clientId: string; seatsAllocated: number;}>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      clientId: "",
      seatsAllocated: 1
    },
  });

  // Save all allocations
  const handleSaveAllocations = () => {
    if (allocations.length === 0 && !isPrivateCourse) {
      toast({
        title: "Warning",
        description: "There are no seat allocations to save",
      });
      return;
    }
    
    saveAllocationsMutation.mutate(allocations, {
      onSuccess: () => {
        navigate("/events");
      }
    });
  };

  // Form submission handler
  const onSubmit = (values: {clientId: string; seatsAllocated: number;}) => {
    const result = handleAddAllocation(values, clients);
    if (result.error) {
      form.setError("seatsAllocated", { 
        type: "max", 
        message: result.error
      });
      return;
    }
    form.reset();
  };

  // Get filtered clients (exclude already allocated ones unless updating)
  const availableClients = clients?.filter(client => 
    !allocations.some(a => a.clientId === client.id) || 
    form.getValues("clientId") === client.id
  );

  // For private courses, display a different UI
  if (isPrivateCourse) {
    return (
      <Card className="border shadow-sm mb-8">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Private Course</CardTitle>
              <CardDescription>
                This is a private course for {courseInstance.host_client?.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-center py-8 border rounded-md bg-slate-50 mb-6">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-medium mb-1">Private Course Allocation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This course has been allocated {courseInstance.private_seats_allocated} seats 
              for {courseInstance.host_client?.name}
            </p>
            <Button 
              onClick={() => navigate("/events")}
              className="mt-2"
            >
              Return to Events
            </Button>
          </div>

          {/* Show a message explaining that students can be managed by the client administrators */}
          <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="font-medium text-blue-800">
              Students for this private course are managed by {courseInstance.host_client?.name} administrators.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-end mt-4 pt-4 border-t">
            <Button
              onClick={() => navigate("/events")}
            >
              Back to Events
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard UI for open enrollment courses
  return (
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
            onSubmit={onSubmit}
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
  );
}
