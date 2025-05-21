import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Program, ProgramExercise } from "@/types/programs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExercisesList } from "./ExercisesList";

const programSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().min(1, "Description is required"),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day"),
  maxStudents: z.coerce.number().min(1, "Maximum students must be at least 1"),
  minStudents: z.coerce.number().min(1, "Minimum students must be at least 1"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  lvl: z.string().min(1, "Level is required"),
  measured: z.boolean().default(false),
});

type ProgramFormValues = z.infer<typeof programSchema>;

interface CreateProgramDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  program?: Program | null;
  getLevelNumber: (level: string) => number;
}

export function CreateProgramDialog({ open, onClose, program, getLevelNumber }: CreateProgramDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const { toast } = useToast();
  const isEditing = !!program;

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      durationDays: 1,
      maxStudents: 20,
      minStudents: 5,
      price: 0,
      lvl: "Basic",
      measured: false,
    },
  });

  const measured = form.watch("measured");

  // Reset form with program data when editing or clear when creating
  useEffect(() => {
    if (open) {
      console.log("Dialog opened with program:", program);
      if (isEditing && program) {
        form.reset({
          name: program.name,
          sku: program.sku,
          description: program.description,
          durationDays: program.durationDays,
          maxStudents: program.maxStudents,
          minStudents: program.minStudents,
          price: program.price,
          lvl: program.lvl,
          measured: program.measured || false,
        });
        setExercises(program.exercises || []);
      } else {
        form.reset({
          name: "",
          sku: "",
          description: "",
          durationDays: 1,
          maxStudents: 20,
          minStudents: 5,
          price: 0,
          lvl: "Basic",
          measured: false,
        });
        setExercises([]);
      }
    }
  }, [open, program, form, isEditing]);

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    
    try {
      // No need to check for required exercises since ExercisesList automatically adds them
      // The code below is more of a safeguard
      
      const programData = {
        name: data.name,
        sku: data.sku,
        description: data.description,
        duration_days: data.durationDays,
        max_students: data.maxStudents,
        min_students: data.minStudents,
        price: data.price,
        lvl: getLevelNumber(data.lvl),
        measured: data.measured,
      };
      
      let programId: number;
      
      if (isEditing && program) {
        console.log("Updating program with ID:", program.id, "and data:", programData);
        const { data: updatedProgram, error: programError } = await supabase
          .from('programs')
          .update(programData)
          .eq('id', parseInt(program.id))
          .select();
        
        if (programError) throw programError;
        programId = parseInt(program.id);
      } else {
        const { data: newProgram, error: programError } = await supabase
          .from('programs')
          .insert(programData)
          .select();
        
        if (programError) throw programError;
        programId = newProgram[0].id;
      }
      
      // Process exercises if this is a measured program
      if (data.measured) {
        // First delete existing exercises (this will cascade delete parameters)
        if (isEditing) {
          const { error: deleteError } = await supabase
            .from('program_exercises')
            .delete()
            .eq('program_id', programId);
          
          if (deleteError) throw deleteError;
        }
        
        // Insert all exercises
        for (const exercise of exercises) {
          const exerciseData = {
            program_id: programId,
            name: exercise.name,
            is_core: exercise.isCore,
            is_measured: exercise.isMeasured,
            measurement_type: exercise.measurementType,
            order: exercise.order,
          };
          
          const { data: newExercise, error: exerciseError } = await supabase
            .from('program_exercises')
            .insert(exerciseData)
            .select();
          
          if (exerciseError) throw exerciseError;
          
          // Insert parameters for this exercise
          if (exercise.parameters && exercise.parameters.length > 0) {
            const parametersData = exercise.parameters.map(param => ({
              exercise_id: newExercise[0].id,
              parameter_name: param.name,
              parameter_value: param.value,
            }));
            
            const { error: paramError } = await supabase
              .from('exercise_parameters')
              .insert(parametersData);
            
            if (paramError) throw paramError;
          }
        }
      }
      
      toast({
        title: isEditing ? "Program updated" : "Program created",
        description: isEditing 
          ? "The program has been successfully updated." 
          : "The program has been successfully created.",
      });
      
      onClose(true);
    } catch (error) {
      console.error("Error saving program:", error);
      toast({
        title: "Error",
        description: "There was an error saving the program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Program" : "Create New Program"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Program Details</TabsTrigger>
                <TabsTrigger value="exercises">Exercises</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Program name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Program description" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lvl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Basic">Basic</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="minStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Students</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Students</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="measured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Measured Program</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Measured programs require specific exercises and can generate performance reports.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              setActiveTab("exercises");
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="exercises" className="pt-4">
                {measured ? (
                  <ExercisesList
                    exercises={exercises}
                    onChange={setExercises}
                    measured={measured}
                  />
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Turn on "Measured Program" in the Program Details tab to manage exercises.
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update Program" : "Create Program"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
