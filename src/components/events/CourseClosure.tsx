import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Save, Upload, AlertCircle, Plus, Trash, Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast, success, error as toastError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingDisplay } from "./allocation/LoadingDisplay";
import { ErrorDisplay } from "./allocation/ErrorDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CourseClosureData, CourseVehicle, CourseInfo, CourseLayout, FinalExerciseParameters, SlalomParameters, LaneChangeParameters } from "@/types/programs";

// Define a proper type for the course instance data that includes clientName
type CourseInstanceWithClient = {
  id: number;
  start_date: string;
  end_date: string | null;
  programs: { id: number; name: string; };
  venues: { id: number; name: string; };
  host_client_id: string | null;
  clientName?: string;
};

// Form validation schema
const formSchema = z.object({
  units: z.enum(["MPH", "KPH"], {
    required_error: "Please select measurement units",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters",
  }),
  notes: z.string().optional(),
  // Core exercise parameters
  slalom_chord: z.coerce.number().positive("Must be positive").default(100),
  slalom_mo: z.coerce.number().positive("Must be positive").default(15),
  lane_change_chord: z.coerce.number().positive("Must be positive").default(120),
  lane_change_mo: z.coerce.number().positive("Must be positive").default(20),
  final_exercise_ideal_time: z.coerce.number().positive("Must be positive").default(70),
  final_exercise_cone_penalty: z.coerce.number().nonnegative().default(3),
  final_exercise_door_penalty: z.coerce.number().nonnegative().default(5),
  // We'll handle file upload and vehicles separately
});

type FormValues = z.infer<typeof formSchema>;

// Define interface for additional exercises
interface ExerciseItem {
  id: string;
  name: string;
  isMeasured: boolean;
  measurementType: 'latacc' | 'time';
  parameters: {
    chord?: number;
    mo?: number;
    idealTime?: number;
    penaltyType?: 'time' | 'annulled';
    penaltyValue?: number;
  };
}

export function CourseClosure() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id) : undefined;
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [vehicles, setVehicles] = useState<CourseVehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState<CourseVehicle>({
    car: 1,
    make: "",
    latAcc: 0.8
  });
  const [additionalExercises, setAdditionalExercises] = useState<ExerciseItem[]>([]);
  const [newExercise, setNewExercise] = useState<ExerciseItem>({
    id: crypto.randomUUID(),
    name: "",
    isMeasured: false,
    measurementType: 'latacc',
    parameters: {}
  });
  const [activeTab, setActiveTab] = useState("basics");

  // Fetch course details
  const { data: courseInstance, isLoading, error } = useQuery({
    queryKey: ["course-instance", courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await supabase
        .from("course_instances")
        .select(`
          id, 
          start_date, 
          end_date,
          programs:program_id(id, name),
          venues:venue_id(id, name),
          host_client_id
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      
      // Create our response with the correct type
      const responseWithClient: CourseInstanceWithClient = { ...data };
      
      // Fetch client info if host_client_id exists
      if (data.host_client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("name")
          .eq("id", data.host_client_id)
          .single();
        
        if (!clientError && clientData) {
          responseWithClient.clientName = clientData.name;
        }
      }
      
      return responseWithClient;
    },
    enabled: !!courseId,
  });

  // Fetch vehicles data
  const vehiclesQuery = useQuery({
    queryKey: ["course-vehicles", courseId],
    queryFn: async () => {
      if (!courseId) return [];

      const { data, error } = await supabase
        .from("course_vehicles")
        .select(`
          car_number,
          vehicles:vehicle_id(id, make, model, latacc)
        `)
        .eq("course_instance_id", courseId);

      if (error) throw error;
      
      // Format vehicle data for our state
      return data.map(item => ({
        car: item.car_number,
        make: item.vehicles.make + (item.vehicles.model ? ` ${item.vehicles.model}` : ''),
        latAcc: item.vehicles.latacc || 0.8
      }));
    },
    enabled: !!courseId
  });

  // Handle vehicles data loading
  useEffect(() => {
    if (vehiclesQuery.data && vehiclesQuery.data.length > 0) {
      setVehicles(vehiclesQuery.data);
    }
  }, [vehiclesQuery.data]);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: "MPH",
      country: "USA",
      notes: "",
      slalom_chord: 100,
      slalom_mo: 15,
      lane_change_chord: 120,
      lane_change_mo: 20,
      final_exercise_ideal_time: 70,
      final_exercise_cone_penalty: 3,
      final_exercise_door_penalty: 5,
    },
  });

  // Vehicle handlers
  const handleAddVehicle = () => {
    if (!newVehicle.make) {
      toast({
        title: "Vehicle make required",
        description: "Please enter a vehicle make",
        variant: "destructive"
      });
      return;
    }
    
    setVehicles([...vehicles, { ...newVehicle }]);
    
    // Find next available car number
    const maxCarNumber = Math.max(...vehicles.map(v => v.car), 0);
    setNewVehicle({
      car: maxCarNumber + 1,
      make: "",
      latAcc: 0.8
    });
  };

  const handleRemoveVehicle = (index: number) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles.splice(index, 1);
    setVehicles(updatedVehicles);
  };

  // Additional Exercise handlers
  const handleAddExercise = () => {
    if (!newExercise.name) {
      toast({
        title: "Exercise name required",
        description: "Please enter an exercise name",
        variant: "destructive"
      });
      return;
    }

    setAdditionalExercises([...additionalExercises, { ...newExercise }]);
    setNewExercise({
      id: crypto.randomUUID(),
      name: "",
      isMeasured: false,
      measurementType: 'latacc',
      parameters: {}
    });
  };

  const handleRemoveExercise = (id: string) => {
    setAdditionalExercises(additionalExercises.filter(ex => ex.id !== id));
  };

  const handleEditExercise = (exercise: ExerciseItem) => {
    setAdditionalExercises(additionalExercises.map(ex => 
      ex.id === exercise.id ? exercise : ex
    ));
  };

  // File input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Generate course closure JSON data
  const generateClosureData = (values: FormValues): CourseClosureData => {
    if (!courseInstance) {
      throw new Error("Course data not available");
    }

    const courseDate = new Date(courseInstance.start_date);
    
    return {
      course_info: {
        units: values.units,
        country: values.country,
        program: courseInstance.programs?.name || "Unknown Program",
        date: format(courseDate, "yyyy-MM-dd"),
        client: courseInstance.clientName || "Unknown Client"
      },
      vehicles: vehicles,
      course_layout: {
        final_exercise: {
          ideal_time_sec: values.final_exercise_ideal_time,
          cone_penalty_sec: values.final_exercise_cone_penalty,
          door_penalty_sec: values.final_exercise_door_penalty,
          slalom: {
            chord: values.slalom_chord,
            mo: values.slalom_mo
          },
          lane_change: {
            chord: values.lane_change_chord,
            mo: values.lane_change_mo
          },
          reverse_time: undefined // Optional
        },
        slalom: {
          chord: values.slalom_chord,
          mo: values.slalom_mo
        },
        lane_change: {
          chord: values.lane_change_chord,
          mo: values.lane_change_mo
        }
      }
    };
  };

  // Submit handler
  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!courseId) throw new Error("No course ID provided");
      
      let zipfileUrl = null;
      let closureDataJson = null;
      
      try {
        // Generate closure data JSON
        const closureData = generateClosureData(values);
        closureDataJson = JSON.stringify(closureData);
        
        // Handle file upload if a file is selected
        if (file) {
          setIsUploading(true);
          
          // Upload file to storage
          const timestamp = Date.now();
          const fileExt = file.name.split('.').pop();
          const fileName = `course-${courseId}-${timestamp}.${fileExt}`;
          const filePath = `course-closures/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("course-documents")
            .upload(filePath, file);
          
          if (uploadError) {
            throw new Error(`File upload failed: ${uploadError.message}`);
          }
          
          // Get the URL for the uploaded file
          const { data: urlData } = await supabase.storage
            .from("course-documents")
            .getPublicUrl(filePath);
            
          zipfileUrl = urlData.publicUrl;
          setIsUploading(false);
        }
        
        // Create course closure record
        const { data, error } = await supabase
          .from("course_closures")
          .insert({
            course_instance_id: courseId,
            status: "draft",
            units: values.units,
            country: values.country,
            zipfile_url: zipfileUrl,
            closed_by: "00000000-0000-0000-0000-000000000000", // Placeholder UUID, should be replaced with actual user ID
            closure_data: closureDataJson // Store the JSON data
          })
          .select();
          
        if (error) throw error;
        return data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      success("Course closure process initiated successfully");
      navigate(`/events/${courseId}`);
    },
    onError: (err) => {
      toastError(`Error: ${err.message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (vehicles.length === 0) {
      toast({
        title: "No vehicles added",
        description: "Please add at least one vehicle before submitting",
        variant: "destructive"
      });
      return;
    }
    
    submitMutation.mutate(values);
  };

  if (isLoading) {
    return <LoadingDisplay text="Loading course details..." />;
  }

  if (error || !courseInstance) {
    return (
      <ErrorDisplay
        title="Error loading course details"
        error={error}
        onBack={() => navigate(`/events/${courseId}`)}
      />
    );
  }

  const startDate = new Date(courseInstance.start_date);
  const endDate = courseInstance.end_date ? new Date(courseInstance.end_date) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(`/events/${courseId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <h1 className="text-2xl font-bold">Close Course</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Closure Form</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="basics">Basic Info</TabsTrigger>
                  <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                  <TabsTrigger value="exercises">Exercises</TabsTrigger>
                </TabsList>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TabsContent value="basics">
                      <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-medium">Course Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Course Name</p>
                            <p>{courseInstance.programs?.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Location</p>
                            <p>{courseInstance.venues?.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Start Date</p>
                            <p>{format(startDate, "MMMM d, yyyy")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">End Date</p>
                            <p>{endDate ? format(endDate, "MMMM d, yyyy") : "N/A"}</p>
                          </div>
                          {courseInstance.clientName && (
                            <div>
                              <p className="text-sm font-medium mb-1">Client</p>
                              <p>{courseInstance.clientName}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Closure Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="units"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Measurement Units</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select units" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="MPH">MPH (Miles per hour)</SelectItem>
                                    <SelectItem value="KPH">KPH (Kilometers per hour)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Add any notes or comments about the course closure..."
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-2">
                          <FormLabel>Course Documentation (Optional)</FormLabel>
                          <div className="flex items-center gap-4">
                            <Input
                              id="file-upload"
                              type="file"
                              accept=".zip,.pdf,.docx,.doc,.xlsx,.xls"
                              onChange={handleFileChange}
                              className="flex-1"
                            />
                            {file && (
                              <p className="text-sm text-muted-foreground">
                                {file.name} ({Math.round(file.size / 1024)} KB)
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Upload course documentation, reports, or other relevant files
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="vehicles">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Course Vehicles</h3>
                        
                        {vehicles.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Car #</TableHead>
                                <TableHead>Make/Model</TableHead>
                                <TableHead>LatAcc</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {vehicles.map((vehicle, i) => (
                                <TableRow key={i}>
                                  <TableCell>{vehicle.car}</TableCell>
                                  <TableCell>{vehicle.make}</TableCell>
                                  <TableCell>{vehicle.latAcc.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleRemoveVehicle(i)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              No vehicles added yet. Add at least one vehicle.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="text-sm font-medium">Add Vehicle</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="car-number">Car Number</Label>
                              <Input 
                                id="car-number"
                                type="number"
                                value={newVehicle.car}
                                onChange={e => setNewVehicle({...newVehicle, car: parseInt(e.target.value) || 1})}
                                min="1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="make">Make/Model</Label>
                              <Input 
                                id="make"
                                value={newVehicle.make}
                                onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
                                placeholder="e.g. Ford Explorer"
                              />
                            </div>
                            <div>
                              <Label htmlFor="latacc">LatAcc</Label>
                              <Input 
                                id="latacc"
                                type="number"
                                step="0.01"
                                min="0.1"
                                max="1.5"
                                value={newVehicle.latAcc}
                                onChange={e => setNewVehicle({...newVehicle, latAcc: parseFloat(e.target.value) || 0.8})}
                              />
                            </div>
                          </div>
                          <Button type="button" onClick={handleAddVehicle} className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Vehicle
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="exercises">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Core Exercise Parameters</h3>
                        
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Slalom</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="slalom_chord"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Chord</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="slalom_mo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>MO</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Lane Change</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="lane_change_chord"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Chord</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lane_change_mo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>MO</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4 space-y-4">
                          <h4 className="font-medium">Final Exercise</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="final_exercise_ideal_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ideal Time (seconds)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="final_exercise_cone_penalty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cone Penalty (seconds)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="final_exercise_door_penalty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Door Penalty (seconds)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="border-t pt-6 mt-6">
                          <h3 className="text-lg font-medium mb-4">Additional Exercises</h3>
                          
                          {additionalExercises.length > 0 ? (
                            <Table className="mb-4">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Exercise</TableHead>
                                  <TableHead>Measured</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Parameters</TableHead>
                                  <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {additionalExercises.map((exercise) => (
                                  <TableRow key={exercise.id}>
                                    <TableCell>{exercise.name}</TableCell>
                                    <TableCell>
                                      {exercise.isMeasured ? 
                                        <Check className="h-4 w-4 text-green-500" /> : 
                                        "No"}
                                    </TableCell>
                                    <TableCell>
                                      {exercise.isMeasured ? 
                                        (exercise.measurementType === 'latacc' ? 'LatAcc' : 'Time') : 
                                        'N/A'}
                                    </TableCell>
                                    <TableCell>
                                      {exercise.isMeasured ? (
                                        exercise.measurementType === 'latacc' ? (
                                          `Chord: ${exercise.parameters.chord || '-'}, MO: ${exercise.parameters.mo || '-'}`
                                        ) : (
                                          `Time: ${exercise.parameters.idealTime || '-'}s, Penalty: ${exercise.parameters.penaltyType || '-'}`
                                        )
                                      ) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleRemoveExercise(exercise.id)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="text-sm text-muted-foreground mb-4">
                              No additional exercises added yet.
                            </p>
                          )}
                          
                          <div className="border rounded-md p-4 space-y-4">
                            <h4 className="text-sm font-medium">Add Exercise</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="exercise-name">Exercise Name</Label>
                                <Input 
                                  id="exercise-name"
                                  value={newExercise.name}
                                  onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                                  placeholder="e.g. Braking"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="measured"
                                  checked={newExercise.isMeasured}
                                  onCheckedChange={checked => 
                                    setNewExercise({...newExercise, isMeasured: checked})
                                  }
                                />
                                <Label htmlFor="measured">Measured Exercise</Label>
                              </div>
                            </div>
                            
                            {newExercise.isMeasured && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <RadioGroup 
                                    value={newExercise.measurementType} 
                                    onValueChange={(value: 'latacc' | 'time') => 
                                      setNewExercise({...newExercise, measurementType: value, parameters: {}})
                                    }
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="latacc" id="latacc" />
                                      <Label htmlFor="latacc">Lateral Acceleration</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="time" id="time" />
                                      <Label htmlFor="time">Time</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                
                                {newExercise.measurementType === 'latacc' && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="chord">Chord</Label>
                                      <Input
                                        id="chord"
                                        type="number"
                                        value={newExercise.parameters.chord || ''}
                                        onChange={e => setNewExercise({
                                          ...newExercise, 
                                          parameters: {
                                            ...newExercise.parameters, 
                                            chord: parseFloat(e.target.value)
                                          }
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="mo">MO</Label>
                                      <Input
                                        id="mo"
                                        type="number"
                                        value={newExercise.parameters.mo || ''}
                                        onChange={e => setNewExercise({
                                          ...newExercise, 
                                          parameters: {
                                            ...newExercise.parameters, 
                                            mo: parseFloat(e.target.value)
                                          }
                                        })}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {newExercise.measurementType === 'time' && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="ideal-time">Ideal Time (seconds)</Label>
                                      <Input
                                        id="ideal-time"
                                        type="number"
                                        step="0.1"
                                        value={newExercise.parameters.idealTime || ''}
                                        onChange={e => setNewExercise({
                                          ...newExercise, 
                                          parameters: {
                                            ...newExercise.parameters, 
                                            idealTime: parseFloat(e.target.value)
                                          }
                                        })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Penalty Type</Label>
                                      <RadioGroup 
                                        value={newExercise.parameters.penaltyType || 'time'}
                                        onValueChange={(value) => setNewExercise({
                                          ...newExercise, 
                                          parameters: {
                                            ...newExercise.parameters, 
                                            penaltyType: value as 'time' | 'annulled'
                                          }
                                        })}
                                        className="flex flex-col space-y-1"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="time" id="penalty-time" />
                                          <Label htmlFor="penalty-time">Time Penalty</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="annulled" id="penalty-annulled" />
                                          <Label htmlFor="penalty-annulled">Annulled Run</Label>
                                        </div>
                                      </RadioGroup>
                                    </div>
                                    
                                    {newExercise.parameters.penaltyType === 'time' && (
                                      <div>
                                        <Label htmlFor="penalty-value">Penalty Time (seconds)</Label>
                                        <Input
                                          id="penalty-value"
                                          type="number"
                                          step="0.1"
                                          value={newExercise.parameters.penaltyValue || ''}
                                          onChange={e => setNewExercise({
                                            ...newExercise, 
                                            parameters: {
                                              ...newExercise.parameters, 
                                              penaltyValue: parseFloat(e.target.value)
                                            }
                                          })}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <Button type="button" onClick={handleAddExercise} className="w-full md:w-auto">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Exercise
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <div className="pt-4 border-t">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Closing a course will finalize all student data and prepare completion records. 
                          This action can be edited later if needed.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex justify-end mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="mr-2"
                          onClick={() => navigate(`/events/${courseId}`)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={submitMutation.isPending || isUploading}
                        >
                          {submitMutation.isPending || isUploading ? (
                            "Processing..."
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Submit Course Closure
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About Course Closure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Course closure is the final step in completing a training event. This process:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Finalizes student attendance records</li>
                <li>Archives course materials and documentation</li>
                <li>Prepares completion certificates</li>
                <li>Updates the course status in the system</li>
              </ul>
              <p className="text-sm mt-4">
                You'll be able to review and modify this information after submission if needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
