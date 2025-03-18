
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Define the form schema with Zod
const formSchema = z.object({
  programId: z.string().min(1, "Program is required"),
  venueId: z.string().min(1, "Venue is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  isOpenEnrollment: z.boolean().default(false),
  hostClientId: z.string().optional(),
  privateSeatsAllocated: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CourseInstanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  // Fetch programs
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programs").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch venues
  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ["venues"],
    queryFn: async () => {
      const { data, error } = await supabase.from("venues").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch course instance if in edit mode
  const { data: courseInstance, isLoading: courseInstanceLoading } = useQuery({
    queryKey: ["courseInstance", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("course_instances")
        .select("*")
        .eq("id", parseInt(id, 10))
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  // Set up form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programId: "",
      venueId: "",
      startDate: new Date(),
      isOpenEnrollment: false,
      hostClientId: "",
      privateSeatsAllocated: 0,
    },
  });

  // Function to calculate end date (fixed to include start date in duration)
  const calculateEndDate = (startDate: Date, durationDays: number) => {
    // Subtract 1 from duration to fix calculation (if duration is 2 days and starts on 22nd, ends on 23rd)
    return addDays(startDate, durationDays - 1);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase.from("course_instances").insert([
        {
          program_id: parseInt(values.programId),
          venue_id: parseInt(values.venueId),
          start_date: values.startDate.toISOString(),
          end_date: values.isOpenEnrollment
            ? null
            : calculateEndDate(values.startDate, selectedProgram?.duration_days || 1).toISOString(),
          is_open_enrollment: values.isOpenEnrollment,
          host_client_id: values.isOpenEnrollment ? null : values.hostClientId,
          private_seats_allocated: values.isOpenEnrollment ? null : values.privateSeatsAllocated,
          visibility_type: values.isOpenEnrollment ? 0 : 1, // Public if open enrollment, private otherwise
        },
      ]).select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ["courseInstances"]});
      toast({
        title: "Success",
        description: "Course has been created successfully",
      });

      // Navigate to allocations page if open enrollment
      if (form.getValues("isOpenEnrollment")) {
        navigate(`/events/${data.id}/allocations`);
      } else {
        navigate("/events");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("course_instances")
        .update({
          program_id: parseInt(values.programId, 10),
          venue_id: parseInt(values.venueId, 10),
          start_date: values.startDate.toISOString(),
          end_date: values.isOpenEnrollment
            ? null
            : calculateEndDate(values.startDate, selectedProgram?.duration_days || 1).toISOString(),
          is_open_enrollment: values.isOpenEnrollment,
          host_client_id: values.isOpenEnrollment ? null : values.hostClientId,
          private_seats_allocated: values.isOpenEnrollment ? null : values.privateSeatsAllocated,
          visibility_type: values.isOpenEnrollment ? 0 : 1, // Public if open enrollment, private otherwise
        })
        .eq("id", parseInt(id || '0', 10))
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ["courseInstances"]});
      toast({
        title: "Success",
        description: "Course has been updated successfully",
      });

      // Navigate to allocations page if open enrollment
      if (form.getValues("isOpenEnrollment")) {
        navigate(`/events/${data.id}/allocations`);
      } else {
        navigate("/events");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update course: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && courseInstance && !courseInstanceLoading) {
      const program = programs?.find(p => p.id === courseInstance.program_id);
      setSelectedProgram(program);
      
      form.reset({
        programId: courseInstance.program_id.toString(),
        venueId: courseInstance.venue_id.toString(),
        startDate: new Date(courseInstance.start_date),
        isOpenEnrollment: courseInstance.is_open_enrollment,
        hostClientId: courseInstance.host_client_id || undefined,
        privateSeatsAllocated: courseInstance.private_seats_allocated || undefined,
      });
    }
  }, [isEditMode, courseInstance, courseInstanceLoading, programs, form]);

  // Handle program selection
  const handleProgramChange = (value: string) => {
    const program = programs?.find(p => p.id.toString() === value);
    setSelectedProgram(program);
    
    // Update private seats if in non-open enrollment mode
    if (!form.getValues("isOpenEnrollment") && program) {
      form.setValue("privateSeatsAllocated", program.min_students || 0);
    }
  };

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Validate seat allocation for private courses
    if (!values.isOpenEnrollment) {
      if (!values.hostClientId) {
        form.setError("hostClientId", { 
          type: "required", 
          message: "Host client is required for private courses" 
        });
        return;
      }
      
      if (!values.privateSeatsAllocated) {
        form.setError("privateSeatsAllocated", { 
          type: "required", 
          message: "Seats allocation is required for private courses" 
        });
        return;
      }
      
      if (selectedProgram) {
        const { min_students, max_students } = selectedProgram;
        
        if (values.privateSeatsAllocated < min_students) {
          form.setError("privateSeatsAllocated", { 
            type: "min", 
            message: `Seats must be at least ${min_students}` 
          });
          return;
        }
        
        if (values.privateSeatsAllocated > max_students) {
          form.setError("privateSeatsAllocated", { 
            type: "max", 
            message: `Seats cannot exceed ${max_students}` 
          });
          return;
        }
      }
    }
    
    if (isEditMode) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  // Loading state
  if (
    programsLoading || 
    venuesLoading || 
    clientsLoading || 
    (isEditMode && courseInstanceLoading)
  ) {
    return (
      <div className="flex justify-center items-center p-8 h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-8 w-48 bg-muted rounded-md"></div>
          <div className="text-muted-foreground text-sm">Loading course data...</div>
        </div>
      </div>
    );
  }

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
          {isEditMode ? "Edit Course" : "Create Course"}
        </h1>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader className="bg-muted/20 rounded-t-lg pb-3">
          <CardTitle className="text-2xl text-primary">{isEditMode ? "Edit Course Details" : "Course Details"}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure the course program, venue, date, and enrollment type
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Program Selection */}
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-base font-medium">Program</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleProgramChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs?.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                              {program.name} ({program.min_students}-{program.max_students} students)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedProgram && (
                        <FormDescription className="mt-2 flex items-center gap-2 bg-secondary/10 p-2 rounded-md text-sm">
                          <span className="font-medium text-secondary-foreground">Duration:</span> {selectedProgram.duration_days} day(s) | 
                          <span className="font-medium text-secondary-foreground">Capacity:</span> {selectedProgram.min_students}-{selectedProgram.max_students} students
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Venue Selection */}
                <FormField
                  control={form.control}
                  name="venueId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-base font-medium">Venue</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a venue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {venues?.map((venue) => (
                            <SelectItem key={venue.id} value={venue.id.toString()}>
                              {venue.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-muted-foreground italic">
                        Select the location where the course will be held
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date Selection */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base font-medium">Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="h-12 w-full pl-3 text-left font-normal flex justify-between items-center"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span className="text-muted-foreground">Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {selectedProgram && field.value && (
                        <FormDescription className="mt-2 bg-secondary/10 p-2 rounded-md text-sm">
                          <span className="font-medium text-secondary-foreground">End Date:</span> {format(calculateEndDate(field.value, selectedProgram.duration_days || 1), "PPP")}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Enrollment Type */}
              <FormField
                control={form.control}
                name="isOpenEnrollment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background hover:bg-muted/10 transition-colors">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Open Enrollment</FormLabel>
                      <FormDescription className="text-muted-foreground">
                        Allow multiple clients to allocate seats for this course
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Client and Seat Allocation (for Private Courses) */}
              {!form.watch("isOpenEnrollment") && (
                <div className="rounded-lg border p-4 pt-3 space-y-4 bg-tertiary/5">
                  <h3 className="text-sm font-semibold text-tertiary mb-2">Private Course Settings</h3>
                  <FormField
                    control={form.control}
                    name="hostClientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Host Client</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-muted-foreground italic">
                          The client hosting this private course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privateSeatsAllocated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Seats Allocated</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-12"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        {selectedProgram && (
                          <FormDescription className="text-muted-foreground italic">
                            Number of seats for this private course (min: {selectedProgram.min_students}, max: {selectedProgram.max_students})
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/events")}
                  className="h-11"
                >
                  Cancel
                </Button>
                <Button type="submit" className="h-11 px-8 font-medium">
                  {isEditMode ? "Update Course" : "Create Course"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

