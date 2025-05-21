
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Save, Upload, AlertCircle } from "lucide-react";
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
import { toast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingDisplay } from "./allocation/LoadingDisplay";
import { ErrorDisplay } from "./allocation/ErrorDisplay";

// Form validation schema
const formSchema = z.object({
  units: z.enum(["MPH", "KPH"], {
    required_error: "Please select measurement units",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters",
  }),
  notes: z.string().optional(),
  // We'll handle file upload separately
});

type FormValues = z.infer<typeof formSchema>;

export function CourseClosure() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id) : undefined;
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
          venues:venue_id(id, name)
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: "MPH",
      country: "USA",
      notes: "",
    },
  });

  // File input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Submit handler
  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!courseId) throw new Error("No course ID provided");
      
      let zipfileUrl = null;
      
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
      
      // Create course closure record - fixing the type issue here
      const { data, error } = await supabase
        .from("course_closures")
        .insert({
          course_instance_id: courseId,
          status: "draft",
          units: values.units,
          country: values.country,
          zipfile_url: zipfileUrl,
          closed_by: "00000000-0000-0000-0000-000000000000", // Placeholder UUID, should be replaced with actual user ID
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Course closure process initiated successfully");
      navigate(`/events/${courseId}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Closing a course will finalize all student data and prepare completion records. 
                      This action can be edited later if needed.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end">
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
                </form>
              </Form>
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
