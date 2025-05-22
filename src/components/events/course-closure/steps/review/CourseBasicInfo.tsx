
import React from "react";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseInstanceWithClient } from "../../CourseClosureWizard";
import { CourseClosureData } from "@/types/programs";

interface CourseBasicInfoProps {
  formData: CourseClosureData;
  courseInstance: CourseInstanceWithClient;
  file: File | null;
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function CourseBasicInfo({ formData, courseInstance, file, onJumpToStep }: CourseBasicInfoProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">Basic Information</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onJumpToStep('basic')}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="font-medium">Course Name</div>
          <div>{courseInstance.programs?.name || "Unknown Course"}</div>
          
          <div className="font-medium">Location</div>
          <div>{courseInstance.venues?.name || "Unknown Location"}</div>
          
          <div className="font-medium">Dates</div>
          <div>
            {format(new Date(courseInstance.start_date), "MMM d, yyyy")}
            {courseInstance.end_date && ` - ${format(new Date(courseInstance.end_date), "MMM d, yyyy")}`}
          </div>
          
          <div className="font-medium">Client</div>
          <div>{courseInstance.clientName || "N/A"}</div>
          
          <div className="font-medium">Country</div>
          <div>{formData.course_info?.country || "USA"}</div>
          
          <div className="font-medium">Units</div>
          <div>{formData.course_info?.units || "MPH"}</div>
          
          <div className="font-medium">Course Data</div>
          <div>
            {file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : "No file uploaded in edit mode"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
