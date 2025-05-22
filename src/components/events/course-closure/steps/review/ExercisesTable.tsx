
import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseLayout, AdditionalExercise } from "@/types/programs";

interface ExercisesTableProps {
  courseLayout: CourseLayout;
  additionalExercises: AdditionalExercise[];
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function ExercisesTable({ courseLayout, additionalExercises, onJumpToStep }: ExercisesTableProps) {
  return (
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
              <TableCell className="text-center">{courseLayout?.slalom?.chord}</TableCell>
              <TableCell className="text-center">{courseLayout?.slalom?.mo}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Lane Change</TableCell>
              <TableCell className="text-center">{courseLayout?.lane_change?.chord}</TableCell>
              <TableCell className="text-center">{courseLayout?.lane_change?.mo}</TableCell>
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
                    <span className="font-medium">{courseLayout?.final_exercise?.ideal_time_sec} sec</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">Cone Penalty:</span>
                    <span className="font-medium">{courseLayout?.final_exercise?.cone_penalty_sec} sec</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">Door Penalty:</span>
                    <span className="font-medium">{courseLayout?.final_exercise?.door_penalty_sec} sec</span>
                  </div>
                  {courseLayout?.final_exercise?.reverse_time && (
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">Reverse Time:</span>
                      <span className="font-medium">{courseLayout?.final_exercise?.reverse_time} sec</span>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="pl-6">Slalom Component</TableCell>
              <TableCell className="text-center">{courseLayout?.final_exercise?.slalom?.chord}</TableCell>
              <TableCell className="text-center">{courseLayout?.final_exercise?.slalom?.mo}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="pl-6">Lane Change Component</TableCell>
              <TableCell className="text-center">{courseLayout?.final_exercise?.lane_change?.chord}</TableCell>
              <TableCell className="text-center">{courseLayout?.final_exercise?.lane_change?.mo}</TableCell>
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
                      {exercise.isMeasured && (
                        <span className="ml-2 text-xs py-0.5 px-1.5 bg-slate-100 rounded-full">
                          {exercise.measurementType === 'latacc' ? 'LatAcc' : 'Time'}
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
                      {exercise.measurementType === 'time' && (
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
  );
}
