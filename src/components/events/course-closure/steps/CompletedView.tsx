
import React, { useState } from "react";
import { CourseClosureData } from "@/types/programs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, CheckCircle, Edit } from "lucide-react";

import { ReviewStep } from "./ReviewStep";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CourseInstanceWithClient } from "../CourseClosureWizard";

interface CompletedViewProps {
  formData: CourseClosureData;
  courseId: number;
  closureId: number | null;
  onEdit: () => void;
}

export function CompletedView({ formData, courseId, closureId, onEdit }: CompletedViewProps) {
  const [editMode, setEditMode] = useState(false);
  
  // Get course details for review
  const { data: courseInstance } = useQuery({
    queryKey: ["course-instance-completed", courseId],
    queryFn: async () => {
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
      
      // Fetch venue country information
      if (data.venues && data.venues.id) {
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("region")
          .eq("id", data.venues.id)
          .single();
          
        if (!venueError && venueData && venueData.region) {
          responseWithClient.venues.country = venueData.region;
        }
      }
      
      return responseWithClient;
    },
    enabled: !!courseId,
  });

  // For file info
  const { data: closureData } = useQuery({
    queryKey: ["closure-details", closureId],
    queryFn: async () => {
      if (!closureId) return null;
      
      const { data, error } = await supabase
        .from("course_closures")
        .select("*")
        .eq("id", closureId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!closureId
  });

  const downloadJson = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `course-${courseId}-closure.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // When the user clicks on Edit Data, properly call onEdit to return to the wizard
  const handleEditClick = () => {
    // Call the parent's onEdit function to navigate back to review step
    onEdit();
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics report
    window.location.href = `/events/${courseId}/analytics`;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Course has been successfully closed. You can download the data, view analytics, or edit if needed.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Closure Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md text-xs overflow-x-auto mb-4">
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleViewAnalytics} className="bg-blue-600 hover:bg-blue-700">
              View Analytics Report
            </Button>
            
            <Button variant="outline" onClick={downloadJson}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
            
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Data
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {closureData?.zipfile_url && (
        <Card>
          <CardHeader>
            <CardTitle>Attached Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>Course documentation file</div>
              <Button variant="outline" asChild>
                <a href={closureData.zipfile_url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
