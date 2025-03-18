
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, Plus, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
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

  // Set up form with React Hook Form
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      clientId: "",
      seatsAllocated: 1
    },
  });

  // Fetch course instance details
  const { data: courseInstance, isLoading: courseLoading } = useQuery({
    queryKey: ["courseInstance", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_instances")
        .select(`
          *,
          program:program_id(
            id,
            name,
            max_students,
            min_students
          ),
          venue:venue_id(
            id,
            name
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch existing allocations
  const { data: existingAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ["courseAllocations", id],
    queryFn: async () => {
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
        .eq("course_instance_id", id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    onSuccess: (data) => {
      const formattedAllocations = data.map(allocation => ({
        id: allocation.id,
        clientId: allocation.client?.id || '',
        clientName: allocation.client?.name || '',
        seatsAllocated: allocation.seats_allocated
      }));
      
      setAllocations(formattedAllocations);
      updateRemainingSeats(formattedAllocations);
    }
  });

  // Fetch clients for allocation
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
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
      // Delete all existing allocations
      const { error: deleteError } = await supabase
        .from("course_allocations")
        .delete()
        .eq("course_instance_id", id);
      
      if (deleteError) throw deleteError;

      // Insert new allocations
      if (allocations.length > 0) {
        const { error: insertError } = await supabase
          .from("course_allocations")
          .insert(
            allocations.map(a => ({
              course_instance_id: parseInt(id || '0'),
              client_id: a.clientId,
              seats_allocated: a.seatsAllocated
            }))
          );
        
        if (insertError) throw insertError;
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
    onError: (error) => {
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
  };

  // Remove an allocation
  const handleRemoveAllocation = (index: number) => {
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
    updateRemainingSeats(newAllocations);
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
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  // Calculate total allocated seats
  const totalAllocated = allocations.reduce(
    (sum, allocation) => sum + allocation.seatsAllocated, 
    0
  );

  // Get filtered clients (exclude already allocated ones unless updating)
  const availableClients = clients?.filter(client => 
    !allocations.some(a => a.clientId === client.id) || 
    form.getValues("clientId") === client.id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center">
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
          Seat Allocations
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Allocate seats for this open enrollment course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {courseInstance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Program</h3>
                <p>{courseInstance.program?.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Venue</h3>
                <p>{courseInstance.venue?.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Date</h3>
                <p>{format(new Date(courseInstance.start_date), "PPP")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Max Capacity</h3>
                <p>{courseInstance.program?.max_students} seats</p>
              </div>
            </div>
          )}

          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Seat Allocations</h2>
              <div className="text-sm text-muted-foreground">
                {totalAllocated} / {courseInstance?.program?.max_students} seats allocated
              </div>
            </div>

            {allocations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Seats</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((allocation, index) => (
                    <TableRow key={index}>
                      <TableCell>{allocation.clientName}</TableCell>
                      <TableCell className="text-right">{allocation.seatsAllocated}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAllocation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No seat allocations yet
              </div>
            )}
          </div>

          {remainingSeats > 0 ? (
            showAddForm ? (
              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Add Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddAllocation)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableClients?.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seatsAllocated"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max={remainingSeats.toString()}
                                placeholder="Number of seats"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.reset();
                            setShowAddForm(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client Allocation
              </Button>
            )
          ) : (
            allocations.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Maximum capacity reached. No more seats can be allocated.
                </AlertDescription>
              </Alert>
            )
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/events")}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveAllocations}>
            Save Allocations
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
