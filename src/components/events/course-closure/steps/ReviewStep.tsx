
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
import { useWizardContext } from "../wizard/WizardContext";

interface ReviewStepProps {
  formData: CourseClosureData;
  courseInstance: CourseInstanceWithClient;
  file: File | null;
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function ReviewStep({ formData, courseInstance, file, onJumpToStep }: ReviewStepProps) {
  const { students, isLoading: studentsLoading } = useEnrolledStudents(courseInstance?.id);
  const { isEditing } = useWizardContext(); // Get whether we're editing an existing closure
  
  console.log("ReviewStep rendering with formData:", formData);
  
  // Ensure we have required arrays to prevent errors - handle both camelCase and snake_case keys
  const vehicles = formData.vehicles || [];
  
  // Handle both camelCase and snake_case versions of additional_exercises
  // This ensures we can render regardless of which property name is used
  const additionalExercises = Array.isArray(formData.additionalExercises) 
    ? formData.additionalExercises 
    : (Array.isArray(formData.additional_exercises) 
        ? formData.additional_exercises 
        : []);
  
  console.log("Additional exercises in ReviewStep:", additionalExercises);
  
  // Skip file validation when editing
  if (!file && !isEditing) {
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
  
  // Safety check - if courseInstance is null or undefined
  if (!courseInstance) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Course instance data is missing. Please go back to the previous page and try again.
          </AlertDescription>
        </Alert>
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
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Vehicles ({vehicles.length})</CardTitle>
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
          {vehicles.length > 0 ? (
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
                {vehicles.map((vehicle, i) => (
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
      
      {/* Exercise Parameters Section */}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium bg-slate-50 w-[200px]">Exercise</TableHead>
                <TableHead className="text-center">Chord (ft)</TableHead>
                <TableHead className="text-center">MO (ft)</TableHead>
                <TableHead className="text-center">Other Parameters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Slalom</TableCell>
                <TableCell className="text-center">{formData.course_layout?.slalom?.chord}</TableCell>
                <TableCell className="text-center">{formData.course_layout?.slalom?.mo}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lane Change</TableCell>
                <TableCell className="text-center">{formData.course_layout?.lane_change?.chord}</TableCell>
                <TableCell className="text-center">{formData.course_layout?.lane_change?.mo}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              
              {/* Final Exercise Section with Timing Parameters first */}
              <TableRow className="bg-slate-50/50">
                <TableCell colSpan={4} className="font-medium py-2">Final Exercise</TableCell>
              </TableRow>
              
              {/* Timing Parameters Row */}
              <TableRow>
                <TableCell className="pl-6">Timing Parameters</TableCell>
                <TableCell colSpan={3}>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">Ideal Time:</span>
                      <span className="font-medium">{formData.course_layout?.final_exercise?.ideal_time_sec} sec</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">Cone Penalty:</span>
                      <span className="font-medium">{formData.course_layout?.final_exercise?.cone_penalty_sec} sec</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">Door Penalty:</span>
                      <span className="font-medium">{formData.course_layout?.final_exercise?.door_penalty_sec} sec</span>
                    </div>
                    {formData.course_layout?.final_exercise?.reverse_time && (
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Reverse Time:</span>
                        <span className="font-medium">{formData.course_layout?.final_exercise?.reverse_time} sec</span>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-6">Slalom Component</TableCell>
                <TableCell className="text-center">{formData.course_layout?.final_exercise?.slalom?.chord}</TableCell>
                <TableCell className="text-center">{formData.course_layout?.final_exercise?.slalom?.mo}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-6">Lane Change Component</TableCell>
                <TableCell className="text-center">{formData.course_layout?.final_exercise?.lane_change?.chord}</TableCell>
                <TableCell className="text-center">{formData.course_layout?.final_exercise?.lane_change?.mo}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              
              {/* Additional exercises section */}
              {additionalExercises && additionalExercises.length > 0 && (
                <>
                  <TableRow className="bg-slate-50/50">
                    <TableCell colSpan={4} className="font-medium py-2">Additional Exercises</TableCell>
                  </TableRow>
                  
                  {additionalExercises.map((exercise, index) => (
                    <TableRow key={exercise.id || index}>
                      <TableCell className="pl-6">
                        {exercise.name}
                        {(exercise.isMeasured || exercise.is_measured) && (
                          <span className="ml-2 text-xs py-0.5 px-1.5 bg-slate-100 rounded-full">
                            {(exercise.measurementType || exercise.measurement_type) === 'latacc' ? 'LatAcc' : 'Time'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {exercise.parameters && exercise.parameters.chord || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {exercise.parameters && exercise.parameters.mo || '-'}
                      </TableCell>
                      <TableCell>
                        {(exercise.measurementType || exercise.measurement_type) === 'time' && (
                          <div className="flex flex-col text-sm">
                            {exercise.parameters && exercise.parameters.idealTime && (
                              <span>Ideal Time: {exercise.parameters.idealTime} sec</span>
                            )}
                            {exercise.parameters && exercise.parameters.penaltyType && (
                              <span>
                                Penalty: {exercise.parameters.penaltyType === 'time' 
                                  ? `${exercise.parameters.penaltyValue || '-'} sec` 
                                  : 'Annulled'}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
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
