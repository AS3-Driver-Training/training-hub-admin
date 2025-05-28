import React, { useState, useEffect } from "react";
import { CourseClosureData, SlalomParameters, LaneChangeParameters, AdditionalExercise } from "@/types/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface ExercisesStepProps {
  formData: Partial<CourseClosureData>;
  onUpdate: (data: Partial<CourseClosureData>) => void;
}

interface ExerciseItem {
  id: string;
  name: string;
  isMeasured: boolean;
  measurementType: 'latacc' | 'time';
  parameters: {
    chord?: number;
    mo?: number;
    idealTime?: number;
    penaltyType?: 'time' | 'annulled';
    penaltyValue?: number;
  };
}

export function ExercisesStep({ formData, onUpdate }: ExercisesStepProps) {
  const [slalomParams, setSlalomParams] = useState<SlalomParameters>(
    formData.course_layout?.slalom || { chord: 100, mo: 15 }
  );
  
  const [laneChangeParams, setLaneChangeParams] = useState<LaneChangeParameters>(
    formData.course_layout?.lane_change || { chord: 120, mo: 20 }
  );
  
  const [finalExercise, setFinalExercise] = useState({
    ideal_time_sec: formData.course_layout?.final_exercise?.ideal_time_sec || 70,
    cone_penalty_sec: formData.course_layout?.final_exercise?.cone_penalty_sec || 3,
    door_penalty_sec: formData.course_layout?.final_exercise?.door_penalty_sec || 5,
    slalom: formData.course_layout?.final_exercise?.slalom || { ...slalomParams },
    lane_change: formData.course_layout?.final_exercise?.lane_change || { ...laneChangeParams },
    reverse_time: formData.course_layout?.final_exercise?.reverse_time
  });
  
  // Get additional exercises from either camelCase or snake_case property
  const initialExercises = formData.additional_exercises || formData.additionalExercises || [];
  
  const [additionalExercises, setAdditionalExercises] = useState<AdditionalExercise[]>(initialExercises);
  
  const [newExercise, setNewExercise] = useState<AdditionalExercise>({
    id: crypto.randomUUID(),
    name: "",
    isMeasured: false,
    measurementType: 'latacc',
    parameters: {}
  });
  
  const [finalExerciseOpen, setFinalExerciseOpen] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  // Update parent form data when core exercise parameters change
  useEffect(() => {
    setFinalExercise(prev => ({
      ...prev,
      slalom: { ...slalomParams },
      lane_change: { ...laneChangeParams }
    }));

    onUpdate({
      course_layout: {
        ...formData.course_layout,
        slalom: slalomParams,
        lane_change: laneChangeParams,
        final_exercise: {
          ...finalExercise,
          slalom: slalomParams,
          lane_change: laneChangeParams
        }
      }
    });
  }, [slalomParams, laneChangeParams]);

  // Update parent form data when final exercise changes
  useEffect(() => {
    onUpdate({
      course_layout: {
        ...formData.course_layout,
        final_exercise: finalExercise
      }
    });
  }, [finalExercise]);

  // Update parent form data when additional exercises change
  useEffect(() => {
    console.log("ExercisesStep: Updating additional exercises:", additionalExercises);
    onUpdate({
      additional_exercises: additionalExercises,
      additionalExercises: additionalExercises // Also update camelCase version
    });
  }, [additionalExercises]);

  const handleAddExercise = () => {
    if (!newExercise.name) return;
    
    const updatedExercises = [...additionalExercises, { ...newExercise }];
    console.log("ExercisesStep: Adding new exercise:", newExercise);
    console.log("ExercisesStep: Updated exercises list:", updatedExercises);
    
    setAdditionalExercises(updatedExercises);
    setNewExercise({
      id: crypto.randomUUID(),
      name: "",
      isMeasured: false,
      measurementType: 'latacc',
      parameters: {}
    });
    setIsAddingExercise(false);
  };

  const handleRemoveExercise = (id: string) => {
    const updatedExercises = additionalExercises.filter(ex => ex.id !== id);
    console.log("ExercisesStep: Removing exercise with id:", id);
    console.log("ExercisesStep: Updated exercises list after removal:", updatedExercises);
    setAdditionalExercises(updatedExercises);
  };

  const updateSlalomParams = (field: keyof SlalomParameters, value: number) => {
    setSlalomParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateLaneChangeParams = (field: keyof LaneChangeParameters, value: number) => {
    setLaneChangeParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateFinalExercise = (field: string, value: any) => {
    setFinalExercise(prev => {
      if (field.startsWith('slalom.')) {
        const slalomField = field.split('.')[1] as keyof SlalomParameters;
        return {
          ...prev,
          slalom: {
            ...prev.slalom,
            [slalomField]: value
          }
        };
      } else if (field.startsWith('lane_change.')) {
        const laneChangeField = field.split('.')[1] as keyof LaneChangeParameters;
        return {
          ...prev,
          lane_change: {
            ...prev.lane_change,
            [laneChangeField]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  // Reusable tooltip component
  const ParameterLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <div className="flex items-center gap-1">
      <Label>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardContent className="p-0 space-y-6">
          {/* Core Exercises Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Course Exercise Parameters</h3>
            
            {/* Slalom Exercise */}
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Slalom Exercise</h4>
                  <Badge variant="outline">Core</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <ParameterLabel 
                    label="Chord (ft)" 
                    tooltip="The straight-line distance between the first and last cone in the slalom."
                  />
                  <Input 
                    type="number"
                    className="text-right w-full"
                    value={slalomParams.chord}
                    onChange={e => updateSlalomParams('chord', parseFloat(e.target.value) || 100)}
                  />
                </div>
                
                <div className="space-y-2">
                  <ParameterLabel 
                    label="Middle Ordinate (ft)" 
                    tooltip="The perpendicular distance from the chord to the middle cone."
                  />
                  <Input 
                    type="number"
                    className="text-right w-full"
                    step="0.1"
                    value={slalomParams.mo}
                    onChange={e => updateSlalomParams('mo', parseFloat(e.target.value) || 15)}
                  />
                </div>
              </div>
            </div>
            
            {/* Lane Change Exercise */}
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Lane Change Exercise</h4>
                  <Badge variant="outline">Core</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <ParameterLabel 
                    label="Chord (ft)" 
                    tooltip="The straight-line distance of the lane change maneuver."
                  />
                  <Input 
                    type="number"
                    className="text-right w-full"
                    value={laneChangeParams.chord}
                    onChange={e => updateLaneChangeParams('chord', parseFloat(e.target.value) || 120)}
                  />
                </div>
                
                <div className="space-y-2">
                  <ParameterLabel 
                    label="Middle Ordinate (ft)" 
                    tooltip="The perpendicular distance between lanes."
                  />
                  <Input 
                    type="number"
                    className="text-right w-full"
                    step="0.1"
                    value={laneChangeParams.mo}
                    onChange={e => updateLaneChangeParams('mo', parseFloat(e.target.value) || 20)}
                  />
                </div>
              </div>
            </div>
            
            {/* Final Exercise */}
            <div className="border rounded-lg p-4">
              <Collapsible
                open={finalExerciseOpen}
                onOpenChange={setFinalExerciseOpen}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Final Exercise</h4>
                    <Badge variant="outline">Core</Badge>
                  </div>
                  
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {finalExerciseOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <ParameterLabel 
                      label="Ideal Time (sec)" 
                      tooltip="Target completion time for the exercise."
                    />
                    <Input 
                      type="number"
                      className="text-right w-full"
                      step="0.1"
                      value={finalExercise.ideal_time_sec}
                      onChange={e => updateFinalExercise('ideal_time_sec', parseFloat(e.target.value) || 70)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <ParameterLabel 
                      label="Cone Penalty (sec)" 
                      tooltip="Time penalty for hitting a cone."
                    />
                    <Input 
                      type="number"
                      className="text-right w-full"
                      step="0.1"
                      value={finalExercise.cone_penalty_sec}
                      onChange={e => updateFinalExercise('cone_penalty_sec', parseFloat(e.target.value) || 3)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <ParameterLabel 
                      label="Door Penalty (sec)" 
                      tooltip="Time penalty for missing a gate/door."
                    />
                    <Input 
                      type="number"
                      className="text-right w-full"
                      step="0.1"
                      value={finalExercise.door_penalty_sec}
                      onChange={e => updateFinalExercise('door_penalty_sec', parseFloat(e.target.value) || 5)}
                    />
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="space-y-4 pt-4 border-t mt-4">
                    <h5 className="font-medium text-sm text-muted-foreground">Slalom Component</h5>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Chord (ft)</Label>
                        <Input 
                          type="number"
                          className="text-right w-full"
                          value={finalExercise.slalom.chord}
                          onChange={e => updateFinalExercise('slalom.chord', parseFloat(e.target.value) || 100)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Middle Ordinate (ft)</Label>
                        <Input 
                          type="number"
                          className="text-right w-full"
                          step="0.1"
                          value={finalExercise.slalom.mo}
                          onChange={e => updateFinalExercise('slalom.mo', parseFloat(e.target.value) || 15)}
                        />
                      </div>
                    </div>
                    
                    <h5 className="font-medium text-sm text-muted-foreground mt-4">Lane Change Component</h5>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Chord (ft)</Label>
                        <Input 
                          type="number"
                          className="text-right w-full"
                          value={finalExercise.lane_change.chord}
                          onChange={e => updateFinalExercise('lane_change.chord', parseFloat(e.target.value) || 120)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Middle Ordinate (ft)</Label>
                        <Input 
                          type="number"
                          className="text-right w-full"
                          step="0.1"
                          value={finalExercise.lane_change.mo}
                          onChange={e => updateFinalExercise('lane_change.mo', parseFloat(e.target.value) || 20)}
                        />
                      </div>
                    </div>
                    
                    <h5 className="font-medium text-sm text-muted-foreground mt-4">Additional Parameters</h5>
                    <div className="space-y-2">
                      <Label>Reverse Maneuver Time (sec)</Label>
                      <Input 
                        type="number"
                        className="text-right w-full"
                        step="0.1"
                        value={finalExercise.reverse_time || ''}
                        onChange={e => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          updateFinalExercise('reverse_time', value);
                        }}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
          
          <Separator />
          
          {/* Additional Exercises Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Additional Exercises</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingExercise(!isAddingExercise)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Exercise
              </Button>
            </div>
            
            {additionalExercises.length > 0 ? (
              <div className="space-y-3">
                {additionalExercises.map((exercise) => (
                  <div key={exercise.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2 items-center">
                        <h4 className="font-medium">{exercise.name}</h4>
                        <Badge variant={exercise.isMeasured ? "default" : "outline"}>
                          {exercise.isMeasured ? 
                            (exercise.measurementType === 'latacc' ? 'LatAcc' : 'Time') : 
                            'Not Measured'}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveExercise(exercise.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {exercise.isMeasured && (
                      <div className="mt-3 text-sm">
                        {exercise.measurementType === 'latacc' ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">Chord (ft)</Label>
                              <div className="font-medium">{exercise.parameters.chord || '-'}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Middle Ordinate (ft)</Label>
                              <div className="font-medium">{exercise.parameters.mo || '-'}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">Ideal Time</Label>
                              <div className="font-medium">{exercise.parameters.idealTime || '-'}s</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Penalty</Label>
                              <div className="font-medium">
                                {exercise.parameters.penaltyType === 'time' ? 
                                  `${exercise.parameters.penaltyValue || '-'}s` : 
                                  'Annulled Run'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : !isAddingExercise ? (
              <div className="text-center py-8 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No additional exercises added</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setIsAddingExercise(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add First Exercise
                </Button>
              </div>
            ) : null}
            
            {/* Add Exercise Form */}
            {isAddingExercise && (
              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-4">New Exercise Details</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exercise-name">Exercise Name</Label>
                      <Input 
                        id="exercise-name"
                        value={newExercise.name}
                        onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                        placeholder="e.g. Braking"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-7">
                      <Switch 
                        id="measured"
                        checked={newExercise.isMeasured}
                        onCheckedChange={checked => 
                          setNewExercise({...newExercise, isMeasured: checked})
                        }
                      />
                      <Label htmlFor="measured">Measured Exercise</Label>
                    </div>
                  </div>
                  
                  {newExercise.isMeasured && (
                    <div className="space-y-4">
                      <div>
                        <Label>Measurement Type</Label>
                        <RadioGroup 
                          value={newExercise.measurementType} 
                          onValueChange={(value: 'latacc' | 'time') => 
                            setNewExercise({...newExercise, measurementType: value, parameters: {}})
                          }
                          className="flex space-x-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="latacc" id="latacc" />
                            <Label htmlFor="latacc">Lateral Acceleration</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="time" id="time" />
                            <Label htmlFor="time">Time</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {newExercise.measurementType === 'latacc' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="chord">Chord (ft)</Label>
                            <Input
                              id="chord"
                              type="number"
                              className="text-right"
                              value={newExercise.parameters.chord || ''}
                              onChange={e => setNewExercise({
                                ...newExercise, 
                                parameters: {
                                  ...newExercise.parameters, 
                                  chord: parseFloat(e.target.value) || undefined
                                }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mo">Middle Ordinate (ft)</Label>
                            <Input
                              id="mo"
                              type="number"
                              className="text-right"
                              value={newExercise.parameters.mo || ''}
                              onChange={e => setNewExercise({
                                ...newExercise, 
                                parameters: {
                                  ...newExercise.parameters, 
                                  mo: parseFloat(e.target.value) || undefined
                                }
                              })}
                            />
                          </div>
                        </div>
                      )}
                      
                      {newExercise.measurementType === 'time' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="ideal-time">Ideal Time (sec)</Label>
                            <Input
                              id="ideal-time"
                              type="number"
                              className="text-right"
                              step="0.1"
                              value={newExercise.parameters.idealTime || ''}
                              onChange={e => setNewExercise({
                                ...newExercise, 
                                parameters: {
                                  ...newExercise.parameters, 
                                  idealTime: parseFloat(e.target.value) || undefined
                                }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Penalty Type</Label>
                            <RadioGroup 
                              value={newExercise.parameters.penaltyType || 'time'}
                              onValueChange={(value) => setNewExercise({
                                ...newExercise, 
                                parameters: {
                                  ...newExercise.parameters, 
                                  penaltyType: value as 'time' | 'annulled'
                                }
                              })}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="time" id="penalty-time" />
                                <Label htmlFor="penalty-time">Time Penalty</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="annulled" id="penalty-annulled" />
                                <Label htmlFor="penalty-annulled">Annulled Run</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          {newExercise.parameters.penaltyType === 'time' && (
                            <div className="space-y-2">
                              <Label htmlFor="penalty-value">Penalty Time (sec)</Label>
                              <Input
                                id="penalty-value"
                                type="number"
                                className="text-right"
                                step="0.1"
                                value={newExercise.parameters.penaltyValue || ''}
                                onChange={e => setNewExercise({
                                  ...newExercise, 
                                  parameters: {
                                    ...newExercise.parameters, 
                                    penaltyValue: parseFloat(e.target.value) || undefined
                                  }
                                })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingExercise(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddExercise} 
                      disabled={!newExercise.name}
                    >
                      Add Exercise
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
