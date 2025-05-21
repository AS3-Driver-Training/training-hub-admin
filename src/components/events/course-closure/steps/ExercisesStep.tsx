
import React, { useState, useEffect } from "react";
import { CourseClosureData, SlalomParameters, LaneChangeParameters } from "@/types/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  
  const [additionalExercises, setAdditionalExercises] = useState<ExerciseItem[]>([]);
  
  const [newExercise, setNewExercise] = useState<ExerciseItem>({
    id: crypto.randomUUID(),
    name: "",
    isMeasured: false,
    measurementType: 'latacc',
    parameters: {}
  });
  
  const [finalExerciseOpen, setFinalExerciseOpen] = useState(false);

  // Update parent form data when core exercise parameters change
  useEffect(() => {
    // Sync the standalone exercises with final exercise sub-components
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

  const handleAddExercise = () => {
    if (!newExercise.name) return;
    
    setAdditionalExercises([...additionalExercises, { ...newExercise }]);
    setNewExercise({
      id: crypto.randomUUID(),
      name: "",
      isMeasured: false,
      measurementType: 'latacc',
      parameters: {}
    });
  };

  const handleRemoveExercise = (id: string) => {
    setAdditionalExercises(additionalExercises.filter(ex => ex.id !== id));
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
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Core Exercises */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Core Exercises</h3>
          
          {/* Slalom Exercise Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    Slalom Exercise
                    <Badge variant="outline">Core</Badge>
                  </CardTitle>
                  <InfoTooltip 
                    text="Configure the parameters for the slalom exercise."
                    side="top"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slalom-chord">Chord (ft)</Label>
                  <Input 
                    id="slalom-chord"
                    type="number"
                    className="text-right"
                    value={slalomParams.chord}
                    onChange={e => updateSlalomParams('chord', parseFloat(e.target.value) || 100)}
                  />
                </div>
                <div>
                  <Label htmlFor="slalom-mo">Middle Ordinate (ft)</Label>
                  <Input 
                    id="slalom-mo"
                    type="number"
                    className="text-right"
                    step="0.1"
                    value={slalomParams.mo}
                    onChange={e => updateSlalomParams('mo', parseFloat(e.target.value) || 15)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lane Change Exercise Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    Lane Change Exercise
                    <Badge variant="outline">Core</Badge>
                  </CardTitle>
                  <InfoTooltip 
                    text="Configure the parameters for the lane change exercise."
                    side="top"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lanechange-chord">Chord (ft)</Label>
                  <Input 
                    id="lanechange-chord"
                    type="number"
                    className="text-right"
                    value={laneChangeParams.chord}
                    onChange={e => updateLaneChangeParams('chord', parseFloat(e.target.value) || 120)}
                  />
                </div>
                <div>
                  <Label htmlFor="lanechange-mo">Middle Ordinate (ft)</Label>
                  <Input 
                    id="lanechange-mo"
                    type="number"
                    className="text-right"
                    step="0.1"
                    value={laneChangeParams.mo}
                    onChange={e => updateLaneChangeParams('mo', parseFloat(e.target.value) || 20)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Final Exercise Card - Collapsible */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    Final Exercise
                    <Badge variant="outline">Core</Badge>
                  </CardTitle>
                  <InfoTooltip 
                    text="Configure the parameters for the final exercise."
                    side="top"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Collapsible
                open={finalExerciseOpen}
                onOpenChange={setFinalExerciseOpen}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="final-ideal-time">Ideal Time (sec)</Label>
                    <Input 
                      id="final-ideal-time"
                      type="number"
                      className="text-right"
                      step="0.1"
                      value={finalExercise.ideal_time_sec}
                      onChange={e => updateFinalExercise('ideal_time_sec', parseFloat(e.target.value) || 70)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="final-cone-penalty">Cone Penalty (sec)</Label>
                    <Input 
                      id="final-cone-penalty"
                      type="number"
                      className="text-right"
                      step="0.1"
                      value={finalExercise.cone_penalty_sec}
                      onChange={e => updateFinalExercise('cone_penalty_sec', parseFloat(e.target.value) || 3)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="final-door-penalty">Door Penalty (sec)</Label>
                    <Input 
                      id="final-door-penalty"
                      type="number"
                      className="text-right"
                      step="0.1"
                      value={finalExercise.door_penalty_sec}
                      onChange={e => updateFinalExercise('door_penalty_sec', parseFloat(e.target.value) || 5)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center pt-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      {finalExerciseOpen ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span>Show More</span>
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="font-medium mb-2">Slalom Component</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="final-slalom-chord">Chord (ft)</Label>
                          <Input 
                            id="final-slalom-chord"
                            type="number"
                            className="text-right"
                            value={finalExercise.slalom.chord}
                            onChange={e => updateFinalExercise('slalom.chord', parseFloat(e.target.value) || 100)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="final-slalom-mo">Middle Ordinate (ft)</Label>
                          <Input 
                            id="final-slalom-mo"
                            type="number"
                            className="text-right"
                            step="0.1"
                            value={finalExercise.slalom.mo}
                            onChange={e => updateFinalExercise('slalom.mo', parseFloat(e.target.value) || 15)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Lane Change Component</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="final-lanechange-chord">Chord (ft)</Label>
                          <Input 
                            id="final-lanechange-chord"
                            type="number"
                            className="text-right"
                            value={finalExercise.lane_change.chord}
                            onChange={e => updateFinalExercise('lane_change.chord', parseFloat(e.target.value) || 120)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="final-lanechange-mo">Middle Ordinate (ft)</Label>
                          <Input 
                            id="final-lanechange-mo"
                            type="number"
                            className="text-right"
                            step="0.1"
                            value={finalExercise.lane_change.mo}
                            onChange={e => updateFinalExercise('lane_change.mo', parseFloat(e.target.value) || 20)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Additional Parameters</h4>
                      <div>
                        <Label htmlFor="final-reverse-time">Reverse Maneuver Time (sec)</Label>
                        <Input 
                          id="final-reverse-time"
                          type="number"
                          className="text-right"
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Additional Exercises */}
        <div>
          <h3 className="text-lg font-medium mb-4">Additional Exercises</h3>
          <Card>
            <CardContent className="pt-6">
              {additionalExercises.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {additionalExercises.map((exercise) => (
                    <Card key={exercise.id} className="border border-muted">
                      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                        <div className="flex gap-2 items-center">
                          <h4 className="font-medium text-sm">{exercise.name}</h4>
                          <Badge variant={exercise.isMeasured ? "default" : "outline"}>
                            {exercise.isMeasured ? 
                              (exercise.measurementType === 'latacc' ? 'LatAcc' : 'Time') : 
                              'Not Measured'}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveExercise(exercise.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="py-3">
                        {exercise.isMeasured && (
                          exercise.measurementType === 'latacc' ? (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Chord (ft)</Label>
                                <div className="font-medium text-right">{exercise.parameters.chord || '-'}</div>
                              </div>
                              <div>
                                <Label>Middle Ordinate (ft)</Label>
                                <div className="font-medium text-right">{exercise.parameters.mo || '-'}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Ideal Time</Label>
                                <div className="font-medium text-right">{exercise.parameters.idealTime || '-'}s</div>
                              </div>
                              <div>
                                <Label>Penalty</Label>
                                <div className="font-medium text-right">
                                  {exercise.parameters.penaltyType === 'time' ? 
                                    `${exercise.parameters.penaltyValue || '-'}s` : 
                                    'Annulled Run'}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground mb-6">
                  No additional exercises added yet
                </div>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Add New Exercise</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
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
                          <div>
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
                          <div>
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
                          <div>
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
                            <div>
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
                  
                  <Button 
                    type="button" 
                    onClick={handleAddExercise} 
                    disabled={!newExercise.name}
                    className="w-full mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Exercise
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
