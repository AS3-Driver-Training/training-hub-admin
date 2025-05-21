import React, { useState } from "react";
import { format } from "date-fns";
import { CourseClosureData } from "@/types/programs";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoTooltip } from "@/components/ui/info-tooltip";

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
      notes: formData.notes || "",
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

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

  const validateFile = (file: File): boolean => {
    setFileError(null);
    
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setFileError("Only ZIP files are allowed");
      toast({
        title: "Invalid file type",
        description: "Please upload a ZIP file",
        variant: "destructive"
      });
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setFileError("File is too large (maximum 10MB)");
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      onFileChange(null);
      return;
    }
    
    if (validateFile(file)) {
      onFileChange(file);
      toast({
        title: "File uploaded",
        description: "Course data file has been uploaded successfully"
      });
    } else {
      onFileChange(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Course Information</h3>
          <InfoTooltip 
            text="Basic information about the course, automatically populated from the course details."
            side="top"
          />
        </div>
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
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Closure Details</h3>
              <InfoTooltip 
                text="Specify the measurement units and add any additional notes about the course closure."
                side="top"
              />
            </div>
            
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
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FormLabel className="flex items-center">
                  Course Data <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <InfoTooltip 
                  text="Upload a ZIP file containing all course data collected during the training."
                  side="top"
                />
              </div>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg transition-colors",
                  "flex flex-col items-center justify-center gap-2 p-6",
                  isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-primary/5",
                  file ? "bg-muted/20" : "",
                  fileError ? "border-destructive" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">
                        Upload course data
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag and drop or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ZIP files only (max 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {fileError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}
              
              <input
                id="file-upload"
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                className="hidden"
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Notes (Optional)</FormLabel>
                    <InfoTooltip 
                      text="Add any additional notes or observations about the course closure."
                      side="top"
                    />
                  </div>
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
          </div>
        </form>
      </Form>
    </div>
  );
}
