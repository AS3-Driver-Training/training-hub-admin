
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
import { Program } from "@/types/programs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const programSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().min(1, "Description is required"),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day"),
  maxStudents: z.coerce.number().min(1, "Maximum students must be at least 1"),
  minStudents: z.coerce.number().min(1, "Minimum students must be at least 1"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  lvl: z.string().min(1, "Level is required"),
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
    },
  });

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
        });
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
        });
      }
    }
  }, [open, program, form, isEditing]);

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    try {
      const programData = {
        name: data.name,
        sku: data.sku,
        description: data.description,
        duration_days: data.durationDays,
        max_students: data.maxStudents,
        min_students: data.minStudents,
        price: data.price,
        lvl: getLevelNumber(data.lvl),
      };
      
      let result;
      
      if (isEditing && program) {
        console.log("Updating program with ID:", program.id, "and data:", programData);
        result = await supabase
          .from('programs')
          .update(programData)
          .eq('id', parseInt(program.id))
          .select();
      } else {
        result = await supabase
          .from('programs')
          .insert(programData)
          .select();
      }
      
      if (result.error) throw result.error;
      
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Program" : "Create New Program"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
