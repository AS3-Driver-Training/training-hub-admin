import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, MapPin, Users, PlusCircle, Building } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CreateProgramDialog } from "@/components/programs/CreateProgramDialog";
import { CreateVenueDialog } from "@/components/venues/CreateVenueDialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";

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
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  
  // Get user profile and role
  const { profile, userRole } = useProfile();
  
  // State for dialogs
  const [isProgramDialogOpen, setProgramDialogOpen] = useState(false);
  const [isVenueDialogOpen, setVenueDialogOpen] = useState(false);

  // Determine if user is internal (can access AS3 programs) or client (can only access client programs)
  const isInternalUser = ["superadmin", "admin", "staff"].includes(userRole);
  const isClientUser = profile?.clientUsers && profile.clientUsers.length > 0;

  // Fetch programs based on user role
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: isInternalUser ? ["programs"] : ["client-programs", profile?.clientUsers?.[0]?.client_id],
    queryFn: async () => {
      if (isInternalUser) {
        // Internal users get AS3 programs
        const { data, error } = await supabase.from("programs").select("*");
        if (error) throw error;
        return data;
      } else if (isClientUser && profile?.clientUsers?.[0]?.client_id) {
        // Client users get their own client programs
        const { data, error } = await supabase
          .from("client_programs")
          .select("*")
          .eq("client_id", profile.clientUsers[0].client_id)
          .eq("is_active", true);
        if (error) throw error;
        return data;
      }
      return [];
    },
    enabled: !!(isInternalUser || (isClientUser && profile?.clientUsers?.[0]?.client_id)),
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

  // Function to calculate end date based on program duration
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
      
      const venue = venues?.find(v => v.id === courseInstance.venue_id);
      setSelectedVenue(venue);
      
      form.reset({
        programId: courseInstance.program_id.toString(),
        venueId: courseInstance.venue_id.toString(),
        startDate: new Date(courseInstance.start_date),
        isOpenEnrollment: courseInstance.is_open_enrollment,
        hostClientId: courseInstance.host_client_id || undefined,
        privateSeatsAllocated: courseInstance.private_seats_allocated || undefined,
      });
    }
  }, [isEditMode, courseInstance, courseInstanceLoading, programs, venues, form]);

  // Handle program selection - updated to work with both program types
  const handleProgramChange = (value: string) => {
    const program = programs?.find(p => p.id.toString() === value);
    setSelectedProgram(program);
    
    // Update private seats if in non-open enrollment mode
    if (!form.getValues("isOpenEnrollment") && program) {
      // Handle both AS3 programs and client programs
      const minStudents = program.min_students || program.max_participants || 0;
      form.setValue("privateSeatsAllocated", minStudents);
    }
  };
  
  // Handle venue selection
  const handleVenueChange = (value: string) => {
    const venue = venues?.find(v => v.id.toString() === value);
    setSelectedVenue(venue);
  };

  // Get level badge color for display - updated to handle client programs
  const getLevelBadgeColor = (level: string): string => {
    switch(level) {
      case "Basic": return "bg-blue-100 text-blue-800";
      case "Intermediate": return "bg-purple-100 text-purple-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Dialog handlers
  const handleProgramDialogClose = (success?: boolean) => {
    setProgramDialogOpen(false);
    if (success) {
      queryClient.invalidateQueries({queryKey: ["programs"]});
    }
  };

  const handleVenueDialogClose = (success?: boolean) => {
    setVenueDialogOpen(false);
    if (success) {
      queryClient.invalidateQueries({queryKey: ["venues"]});
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
        <CardHeader className="bg-slate-50/80 rounded-t-lg pb-3">
          <CardTitle className="text-2xl text-primary">{isEditMode ? "Edit Course Details" : "Course Details"}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure the course program, venue, date, and enrollment type
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-8">
                {/* Program Section - Updated for different program types */}
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-medium">
                      {isInternalUser ? "AS3 Program Details" : "Custom Program Details"}
                    </h3>
                    {!isEditMode && isInternalUser && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setProgramDialogOpen(true)}
                        className="text-xs"
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        New Program
                      </Button>
                    )}
                  </div>
                  <Separator className="my-2" />
                  
                  <FormField
                    control={form.control}
                    name="programId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Program</FormLabel>
                        <div className="flex gap-4">
                          <div className="flex-grow">
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProgramChange(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select a program" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {programs?.map((program) => (
                                  <SelectItem key={program.id} value={program.id.toString()}>
                                    <div className="flex flex-col">
                                      <span>{program.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {isInternalUser 
                                          ? `${program.min_students}-${program.max_students} students | ${program.duration_days} day(s)`
                                          : `Max ${program.max_participants || 'unlimited'} participants | ${program.duration_days} day(s)`
                                        }
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {selectedProgram && (
                          <div className="mt-4 p-4 border rounded-lg bg-slate-50/80">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{selectedProgram.name}</h4>
                              {isInternalUser && selectedProgram.lvl && (
                                <Badge 
                                  variant="secondary" 
                                  className={getLevelBadgeColor(selectedProgram.lvl)}
                                >
                                  {selectedProgram.lvl}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                              <div className="bg-white p-3 rounded-md border shadow-sm">
                                <div className="text-xs text-muted-foreground">Duration</div>
                                <div className="font-medium flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                  {selectedProgram.duration_days} day(s)
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded-md border shadow-sm">
                                <div className="text-xs text-muted-foreground">Capacity</div>
                                <div className="font-medium flex items-center">
                                  <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                  {isInternalUser 
                                    ? `${selectedProgram.min_students}-${selectedProgram.max_students} students`
                                    : `Max ${selectedProgram.max_participants || 'unlimited'} participants`
                                  }
                                </div>
                              </div>
                              {isInternalUser && selectedProgram.price && (
                                <div className="bg-white p-3 rounded-md border shadow-sm">
                                  <div className="text-xs text-muted-foreground">Program Price</div>
                                  <div className="font-medium">
                                    ${selectedProgram.price}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {selectedProgram.description && (
                              <div className="mt-3 text-sm text-muted-foreground">
                                {selectedProgram.description}
                              </div>
                            )}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Venue Section */}
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-medium">Venue</h3>
                    {!isEditMode && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setVenueDialogOpen(true)}
                        className="text-xs"
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        New Venue
                      </Button>
                    )}
                  </div>
                  <Separator className="my-2" />
                  
                  <FormField
                    control={form.control}
                    name="venueId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Location</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleVenueChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select a venue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {venues?.map((venue) => (
                              <SelectItem key={venue.id} value={venue.id.toString()}>
                                <div className="flex flex-col">
                                  <span>{venue.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {venue.region}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedVenue && (
                          <div className="mt-4 p-4 border rounded-lg bg-slate-50/80">
                            <div className="font-semibold mb-2">{selectedVenue.name}</div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center text-sm">
                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                <span>{selectedVenue.address || 'Address not provided'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Building className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                <span>Region: {selectedVenue.region || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date & Enrollment */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Start Date Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Schedule</h3>
                    <Separator className="my-2" />
                    
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Dates</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="h-10 w-full pl-3 text-left font-normal flex justify-between items-center"
                                >
                                  {field.value && selectedProgram ? (
                                    <span>
                                      {format(field.value, "MMM d, yyyy")} - {format(calculateEndDate(field.value, selectedProgram.duration_days || 1), "MMM d, yyyy")}
                                      <span className="ml-1 text-muted-foreground text-xs">({selectedProgram.duration_days} day{selectedProgram.duration_days !== 1 ? 's' : ''})</span>
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">Select start date</span>
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
                            <div className="mt-3 bg-white p-3 rounded-md border shadow-sm">
                              <div className="flex items-start space-x-2">
                                <div className="flex-1">
                                  <div className="text-xs font-medium">Start Date</div>
                                  <div className="font-medium">{format(field.value, "EEEE, MMMM d, yyyy")}</div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-medium">End Date</div>
                                  <div className="font-medium">
                                    {format(calculateEndDate(field.value, selectedProgram.duration_days || 1), "EEEE, MMMM d, yyyy")}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Enrollment Type */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Enrollment Type</h3>
                    <Separator className="my-2" />
                    
                    <FormField
                      control={form.control}
                      name="isOpenEnrollment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-white hover:bg-slate-50 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Open Enrollment</FormLabel>
                            <FormDescription className="text-xs">
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
                  </div>
                </div>

                {/* Client and Seat Allocation (for Private Courses) */}
                {!form.watch("isOpenEnrollment") && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Private Course Settings</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid md:grid-cols-2 gap-4 rounded-lg border p-4 bg-slate-50/50">
                      <FormField
                        control={form.control}
                        name="hostClientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Host Client</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 bg-white">
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
                            <FormDescription className="text-xs">
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
                            <FormLabel>Seats Allocated</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="h-10 bg-white"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            {selectedProgram && (
                              <FormDescription className="text-xs">
                                Number of seats (min: {selectedProgram.min_students}, max: {selectedProgram.max_students})
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/events")}
                  className="h-10"
                >
                  Cancel
                </Button>
                <Button type="submit" className="h-10 px-6 font-medium">
                  {isEditMode ? "Update Course" : "Create Course"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Program Dialog - Only show for internal users */}
      {isInternalUser && (
        <CreateProgramDialog 
          open={isProgramDialogOpen} 
          onClose={handleProgramDialogClose}
          program={null}
          getLevelNumber={(level) => {
            switch(level) {
              case "Basic": return 1;
              case "Intermediate": return 2;
              case "Advanced": return 3;
              default: return 1;
            }
          }}
        />
      )}

      {/* Venue Dialog */}
      <CreateVenueDialog 
        open={isVenueDialogOpen} 
        onClose={handleVenueDialogClose}
        venue={null}
      />
    </div>
  );
}
