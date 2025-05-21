
import React from "react";
import { format } from "date-fns";
import { CourseClosureData } from "@/types/programs";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface BasicInfoStepProps {
  courseInstance: CourseInstanceWithClient;
  formData: Partial<CourseClosureData>;
  onUpdate: (data: Partial<CourseClosureData>) => void;
  onFileChange: (file: File | null) => void;
  file: File | null;
}

// Form validation schema
const formSchema = z.object({
  units: z.enum(["MPH", "KPH"], {
    required_error: "Please select measurement units",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BasicInfoStep({ courseInstance, formData, onUpdate, onFileChange, file }: BasicInfoStepProps) {
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: (formData.course_info?.units as "MPH" | "KPH") || "MPH",
      notes: "",
    },
  });

  const startDate = new Date(courseInstance.start_date);
  const endDate = courseInstance.end_date ? new Date(courseInstance.end_date) : null;

  const handleSubmit = (values: FormValues) => {
    onUpdate({
      course_info: {
        ...formData.course_info,
        units: values.units,
      },
      notes: values.notes,
    });
  };

  // Auto-submit when values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      // Only update if we have values (prevents initial empty update)
      if (value.units) {
        handleSubmit(value as FormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium">Course Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Course Name</p>
            <p className="p-2 bg-muted rounded">{courseInstance.programs?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Location</p>
            <p className="p-2 bg-muted rounded">{courseInstance.venues?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Start Date</p>
            <p className="p-2 bg-muted rounded">{format(startDate, "MMMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">End Date</p>
            <p className="p-2 bg-muted rounded">{endDate ? format(endDate, "MMMM d, yyyy") : "N/A"}</p>
          </div>
          {courseInstance.clientName && (
            <div>
              <p className="text-sm font-medium mb-1">Client</p>
              <p className="p-2 bg-muted rounded">{courseInstance.clientName}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium mb-1">Country</p>
            <p className="p-2 bg-muted rounded">
              {courseInstance.venues?.country || formData.course_info?.country || "USA"}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Closure Details</h3>
            
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
        </form>
      </Form>
    </div>
  );
}
