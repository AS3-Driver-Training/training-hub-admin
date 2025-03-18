
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
  Trash2, 
  Users, 
  Calendar, 
  MapPin, 
  UserPlus,
  Clock,
  Info,
  ExternalLink
} from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

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
            min_students,
            description
          ),
          venue:venue_id(
            id,
            name,
            address,
            city,
            state
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

  const progressColorClass = 
    allocationPercentage >= 90 ? "bg-red-500" : 
    allocationPercentage >= 70 ? "bg-amber-500" : 
    "bg-emerald-500";

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
            {courseInstance?.program?.name || "Course Details"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {courseInstance?.start_date && format(new Date(courseInstance.start_date), "MMMM d, yyyy")} - 
          {courseInstance?.end_date && format(new Date(courseInstance.end_date), " MMMM d, yyyy")}
        </p>
      </div>

      {/* Course Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Status Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
            <p className="text-lg font-semibold mb-4">Current event status</p>
            <Badge className="bg-primary text-white">Scheduled</Badge>
          </CardContent>
        </Card>

        {/* Available Seats Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Seats</h3>
            <p className="text-sm text-muted-foreground mb-2">Seats remaining for this session</p>
            
            <div className="flex items-baseline mb-2">
              <span className="text-3xl font-bold">{remainingSeats}</span>
              <span className="text-lg text-muted-foreground ml-1">/{maxStudents}</span>
            </div>
            
            <Progress 
              value={allocationPercentage} 
              className={`h-2 bg-muted`} 
              // Fix the error by applying styles directly to the component
              style={{ 
                '--progress-color': allocationPercentage >= 90 ? '#ef4444' : 
                                  allocationPercentage >= 70 ? '#f59e0b' : 
                                  '#10b981'
              } as React.CSSProperties}
            />
          </CardContent>
        </Card>

        {/* Duration Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Duration</h3>
            <p className="text-sm text-muted-foreground mb-2">Length of training</p>
            
            {courseInstance && (
              <>
                <p className="text-3xl font-bold mb-2">
                  {Math.ceil((new Date(courseInstance.end_date).getTime() - new Date(courseInstance.start_date).getTime()) / (1000 * 60 * 60 * 24)) || 1} Days
                </p>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>08:00 - 17:00</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Program Details & Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Program Details Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
              <h3 className="text-xl font-semibold">Program Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                <p className="font-medium">
                  {courseInstance?.start_date && format(new Date(courseInstance.start_date), "MMMM d, yyyy")}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                <p className="font-medium">
                  {courseInstance?.venue?.city}, {courseInstance?.venue?.state || 'California'}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Course Description</h4>
              <p className="text-muted-foreground">
                {courseInstance?.program?.description || 
                  "Advanced Evasive Skill and Heuristic Development Course for students that have gone through the Lvl 1 course within the past 2 years."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location Details Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Location Details</h3>
            
            <p className="font-medium mb-2">
              {courseInstance?.venue?.name || "Weather Tech Laguna Seca International Raceway"}
            </p>
            
            <p className="text-muted-foreground mb-1">
              {courseInstance?.venue?.address || "1021 Monterey Salinas Hwy"}
            </p>
            <p className="text-muted-foreground mb-4">
              {courseInstance?.venue?.city || "Monterey"}, {courseInstance?.venue?.state || "California"} 93908
            </p>
            
            <div className="p-3 bg-muted/20 rounded-md border mb-4">
              <h4 className="text-sm font-medium mb-1">Meeting Point:</h4>
              <p className="text-sm text-muted-foreground">
                Main paddock next to the gas pumps 15 prior to starting hour.
              </p>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              View on Google Maps
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Students / Seat Allocations Section */}
      <Card className="border shadow-sm mb-8">
        <CardHeader className="border-b bg-muted/10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Seat Allocations</CardTitle>
              <CardDescription>Assign available seats to clients for this course</CardDescription>
            </div>
            
            {remainingSeats > 0 && !showAddForm && (
              <Button 
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="bg-primary text-primary-foreground"
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
            <Card className="border shadow-sm mb-6">
              <CardHeader className="py-3 px-4 border-b bg-muted/10">
                <CardTitle className="text-base flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Seats to Client
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4">
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
                      <Button type="submit" size="sm">Assign</Button>
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
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-medium">Client</TableHead>
                    <TableHead className="text-right font-medium">Seats</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((allocation, index) => (
                    <TableRow key={index} className="hover:bg-muted/10">
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
            <div className="text-center py-12 border rounded-md bg-muted/5">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-medium mb-1">No seat allocations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Assign available seats to clients for this course
              </p>
              {!showAddForm && remainingSeats > 0 && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Seats
                </Button>
              )}
            </div>
          )}

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
