
import React from "react";
import { format } from "date-fns";
import { CourseClosureData } from "@/types/programs";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Edit } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewStepProps {
  formData: CourseClosureData;
  courseInstance: CourseInstanceWithClient;
  file: File | null;
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function ReviewStep({ formData, courseInstance, file, onJumpToStep }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Review all information before finalizing the course closure. You can edit any section if needed.
        </AlertDescription>
      </Alert>
      
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
            <div>{courseInstance.programs?.name}</div>
            
            <div className="font-medium">Location</div>
            <div>{courseInstance.venues?.name}</div>
            
            <div className="font-medium">Dates</div>
            <div>
              {format(new Date(courseInstance.start_date), "MMM d, yyyy")}
              {courseInstance.end_date && ` - ${format(new Date(courseInstance.end_date), "MMM d, yyyy")}`}
            </div>
            
            <div className="font-medium">Client</div>
            <div>{courseInstance.clientName || "N/A"}</div>
            
            <div className="font-medium">Country</div>
            <div>{formData.course_info.country}</div>
            
            <div className="font-medium">Units</div>
            <div>{formData.course_info.units}</div>
            
            <div className="font-medium">Documentation</div>
            <div>{file ? file.name : "No files attached"}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Vehicles ({formData.vehicles.length})</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onJumpToStep('vehicles')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          {formData.vehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car #</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>LatAcc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.vehicles.map((vehicle, i) => (
                  <TableRow key={i}>
                    <TableCell>{vehicle.car}</TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.year || "N/A"}</TableCell>
                    <TableCell>{vehicle.latAcc.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No vehicles have been added. Please add at least one vehicle.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Exercise Parameters</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onJumpToStep('exercises')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Slalom</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>Chord</div>
                <div>{formData.course_layout.slalom.chord}</div>
                <div>MO (Maximum Offset)</div>
                <div>{formData.course_layout.slalom.mo}</div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-2">Lane Change</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>Chord</div>
                <div>{formData.course_layout.lane_change.chord}</div>
                <div>MO (Maximum Offset)</div>
                <div>{formData.course_layout.lane_change.mo}</div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-2">Final Exercise</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>Ideal Time</div>
                <div>{formData.course_layout.final_exercise.ideal_time_sec} seconds</div>
                <div>Cone Penalty</div>
                <div>{formData.course_layout.final_exercise.cone_penalty_sec} seconds</div>
                <div>Door Penalty</div>
                <div>{formData.course_layout.final_exercise.door_penalty_sec} seconds</div>
                
                <div className="col-span-2 mt-2 font-medium">Slalom Component</div>
                <div className="pl-4">Chord</div>
                <div>{formData.course_layout.final_exercise.slalom.chord}</div>
                <div className="pl-4">MO</div>
                <div>{formData.course_layout.final_exercise.slalom.mo}</div>
                
                <div className="col-span-2 mt-2 font-medium">Lane Change Component</div>
                <div className="pl-4">Chord</div>
                <div>{formData.course_layout.final_exercise.lane_change.chord}</div>
                <div className="pl-4">MO</div>
                <div>{formData.course_layout.final_exercise.lane_change.mo}</div>
                
                {formData.course_layout.final_exercise.reverse_time && (
                  <>
                    <div className="col-span-2 mt-2 font-medium">Additional Parameters</div>
                    <div className="pl-4">Reverse Time</div>
                    <div>{formData.course_layout.final_exercise.reverse_time} seconds</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>JSON Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
