
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, Plus, Trash2, Users, Calendar, MapPin, UserPlus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
        .eq("id", parseInt(id || '0', 10))
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
        .eq("course_instance_id", parseInt(id || '0', 10));
      
      if (error) throw error;
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
        .eq("course_instance_id", parseInt(id || '0', 10));
      
      if (deleteError) throw deleteError;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Details Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Course Details
            </CardTitle>
            <CardDescription>
              Program and venue information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseInstance && (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Program</h3>
                  <p className="font-medium">{courseInstance.program?.name}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Venue</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p>{courseInstance.venue?.name}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{format(new Date(courseInstance.start_date), "PPP")}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{courseInstance.program?.max_students} seats</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Allocated</span>
                    <span>{totalAllocated} / {maxStudents} seats</span>
                  </div>
                  <Progress 
                    value={allocationPercentage} 
                    className="h-2"
                    indicatorClassName={allocationPercentage >= 90 ? "bg-red-500" : allocationPercentage >= 70 ? "bg-amber-500" : "bg-emerald-500"}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {remainingSeats} seats remaining
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Allocations Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Seat Allocations
                </CardTitle>
                <CardDescription>
                  Assign seats to clients for this course
                </CardDescription>
              </div>
              
              {remainingSeats > 0 && !showAddForm && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  size="sm"
                  className="mt-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Allocation
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Allocation Form */}
            {showAddForm && (
              <Card className="border shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Client Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddAllocation)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  placeholder={`Seats (max: ${remainingSeats})`}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            form.reset();
                            setShowAddForm(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" size="sm">Add</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Allocations Table */}
            {allocations.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Seats</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((allocation, index) => (
                      <TableRow key={index} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{allocation.clientName}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-medium">
                            {allocation.seatsAllocated}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAllocation(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md bg-muted/10">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium mb-1">No allocations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Assign seats to clients for this course
                </p>
                {!showAddForm && remainingSeats > 0 && (
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client Allocation
                  </Button>
                )}
              </div>
            )}

            {allocations.length > 0 && remainingSeats === 0 && (
              <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
                <AlertCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="font-medium text-emerald-800">
                  All available seats have been allocated.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate("/events")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAllocations}
              disabled={allocations.length === 0}
            >
              Save Allocations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
