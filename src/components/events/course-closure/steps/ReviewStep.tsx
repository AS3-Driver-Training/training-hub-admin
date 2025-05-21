
import React from "react";
import { format } from "date-fns";
import { CourseClosureData } from "@/types/programs";
import { CourseInstanceWithClient } from "../CourseClosureWizard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Edit, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEnrolledStudents } from "../hooks/useEnrolledStudents";

interface ReviewStepProps {
  formData: CourseClosureData;
  courseInstance: CourseInstanceWithClient;
  file: File | null;
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function ReviewStep({ formData, courseInstance, file, onJumpToStep }: ReviewStepProps) {
  const { students, isLoading: studentsLoading } = useEnrolledStudents(courseInstance?.id);
  
  if (!file) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Course data file is required. Please go back to the Basic Information step to upload it.
          </AlertDescription>
        </Alert>
        <Button onClick={() => onJumpToStep('basic')}>
          Go to Basic Information
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Review all information before finalizing the course closure. You can go back to any section to make changes.
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
            
            <div className="font-medium">Course Data</div>
            <div>{file.name} ({(file.size / 1024).toFixed(1)} KB)</div>
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
                    <TableCell>{vehicle.make} {vehicle.model || ''}</TableCell>
                    <TableCell>{vehicle.year || "N/A"}</TableCell>
                    <TableCell>{vehicle.latAcc ? vehicle.latAcc.toFixed(2) : "N/A"}</TableCell>
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
      
      {/* Redesigned Exercise Parameters Section */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium bg-slate-50">Exercise</TableHead>
                  <TableHead className="text-center">Chord (ft)</TableHead>
                  <TableHead className="text-center">MO (ft)</TableHead>
                  <TableHead className="text-center">Other Parameters</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Slalom</TableCell>
                  <TableCell className="text-center">{formData.course_layout.slalom.chord}</TableCell>
                  <TableCell className="text-center">{formData.course_layout.slalom.mo}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Lane Change</TableCell>
                  <TableCell className="text-center">{formData.course_layout.lane_change.chord}</TableCell>
                  <TableCell className="text-center">{formData.course_layout.lane_change.mo}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={4} className="font-medium py-2">Final Exercise</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-6">Slalom Component</TableCell>
                  <TableCell className="text-center">{formData.course_layout.final_exercise.slalom.chord}</TableCell>
                  <TableCell className="text-center">{formData.course_layout.final_exercise.slalom.mo}</TableCell>
                  <TableCell rowSpan={2} className="align-top">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-muted-foreground">Timing Parameters</div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div>Ideal Time:</div>
                        <div>{formData.course_layout.final_exercise.ideal_time_sec} sec</div>
                        <div>Cone Penalty:</div>
                        <div>{formData.course_layout.final_exercise.cone_penalty_sec} sec</div>
                        <div>Door Penalty:</div>
                        <div>{formData.course_layout.final_exercise.door_penalty_sec} sec</div>
                        {formData.course_layout.final_exercise.reverse_time && (
                          <>
                            <div>Reverse Time:</div>
                            <div>{formData.course_layout.final_exercise.reverse_time} sec</div>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-6">Lane Change Component</TableCell>
                  <TableCell className="text-center">{formData.course_layout.final_exercise.lane_change.chord}</TableCell>
                  <TableCell className="text-center">{formData.course_layout.final_exercise.lane_change.mo}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Students Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Enrolled Students ({students.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
            </div>
          ) : students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.first_name} {student.last_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert variant="default" className="bg-slate-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No students are enrolled in this course.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {formData.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{formData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
