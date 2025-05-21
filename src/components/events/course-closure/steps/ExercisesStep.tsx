import React, { useState, useEffect } from "react";
import { CourseClosureData, SlalomParameters, LaneChangeParameters } from "@/types/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";

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
  
  const [activeTab, setActiveTab] = useState('slalom');

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="slalom" className="flex-1">Slalom</TabsTrigger>
          <TabsTrigger value="lanechange" className="flex-1">Lane Change</TabsTrigger>
          <TabsTrigger value="final" className="flex-1">Final Exercise</TabsTrigger>
          <TabsTrigger value="additional" className="flex-1">Additional</TabsTrigger>
        </TabsList>
        
        <TabsContent value="slalom">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Slalom Exercise</span>
                  <Badge variant="outline">Core Exercise</Badge>
                </CardTitle>
                <InfoTooltip 
                  text="Configure the parameters for the slalom exercise, including chord and maximum offset."
                  side="left"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="slalom-chord">Chord</Label>
                  <Input 
                    id="slalom-chord"
                    type="number"
                    value={slalomParams.chord}
                    onChange={e => updateSlalomParams('chord', parseFloat(e.target.value) || 100)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Distance between cones in feet
                  </p>
                </div>
                <div>
                  <Label htmlFor="slalom-mo">MO (Maximum Offset)</Label>
                  <Input 
                    id="slalom-mo"
                    type="number"
                    step="0.1"
                    value={slalomParams.mo}
                    onChange={e => updateSlalomParams('mo', parseFloat(e.target.value) || 15)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum lateral distance in feet
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lanechange">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Lane Change Exercise</span>
                  <Badge variant="outline">Core Exercise</Badge>
                </CardTitle>
                <InfoTooltip 
                  text="Configure the parameters for the lane change exercise, including chord and maximum offset."
                  side="left"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="lanechange-chord">Chord</Label>
                  <Input 
                    id="lanechange-chord"
                    type="number"
                    value={laneChangeParams.chord}
                    onChange={e => updateLaneChangeParams('chord', parseFloat(e.target.value) || 120)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Distance between gates in feet
                  </p>
                </div>
                <div>
                  <Label htmlFor="lanechange-mo">MO (Maximum Offset)</Label>
                  <Input 
                    id="lanechange-mo"
                    type="number"
                    step="0.1"
                    value={laneChangeParams.mo}
                    onChange={e => updateLaneChangeParams('mo', parseFloat(e.target.value) || 20)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum lateral distance in feet
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="final">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Final Exercise</span>
                  <Badge variant="outline">Core Exercise</Badge>
                </CardTitle>
                <InfoTooltip 
                  text="Configure the parameters for the final exercise, including ideal time, penalties, and component exercises."
                  side="left"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="final-ideal-time">Ideal Time (seconds)</Label>
                  <Input 
                    id="final-ideal-time"
                    type="number"
                    step="0.1"
                    value={finalExercise.ideal_time_sec}
                    onChange={e => updateFinalExercise('ideal_time_sec', parseFloat(e.target.value) || 70)}
                  />
                </div>
                <div>
                  <Label htmlFor="final-cone-penalty">Cone Penalty (seconds)</Label>
                  <Input 
                    id="final-cone-penalty"
                    type="number"
                    step="0.1"
                    value={finalExercise.cone_penalty_sec}
                    onChange={e => updateFinalExercise('cone_penalty_sec', parseFloat(e.target.value) || 3)}
                  />
                </div>
                <div>
                  <Label htmlFor="final-door-penalty">Door Penalty (seconds)</Label>
                  <Input 
                    id="final-door-penalty"
                    type="number"
                    step="0.1"
                    value={finalExercise.door_penalty_sec}
                    onChange={e => updateFinalExercise('door_penalty_sec', parseFloat(e.target.value) || 5)}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Slalom Component</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="final-slalom-chord">Chord</Label>
                    <Input 
                      id="final-slalom-chord"
                      type="number"
                      value={finalExercise.slalom.chord}
                      onChange={e => updateFinalExercise('slalom.chord', parseFloat(e.target.value) || 100)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="final-slalom-mo">MO (Maximum Offset)</Label>
                    <Input 
                      id="final-slalom-mo"
                      type="number"
                      step="0.1"
                      value={finalExercise.slalom.mo}
                      onChange={e => updateFinalExercise('slalom.mo', parseFloat(e.target.value) || 15)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Lane Change Component</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="final-lanechange-chord">Chord</Label>
                    <Input 
                      id="final-lanechange-chord"
                      type="number"
                      value={finalExercise.lane_change.chord}
                      onChange={e => updateFinalExercise('lane_change.chord', parseFloat(e.target.value) || 120)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="final-lanechange-mo">MO (Maximum Offset)</Label>
                    <Input 
                      id="final-lanechange-mo"
                      type="number"
                      step="0.1"
                      value={finalExercise.lane_change.mo}
                      onChange={e => updateFinalExercise('lane_change.mo', parseFloat(e.target.value) || 20)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Additional Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="final-reverse-time">Reverse Maneuver Time (seconds)</Label>
                    <Input 
                      id="final-reverse-time"
                      type="number"
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="additional">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Additional Exercises</CardTitle>
                  <InfoTooltip 
                    text="Add any additional exercises that were part of the course but not included in the core exercises."
                    side="left"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {additionalExercises.length > 0 ? (
                  <div className="space-y-4">
                    {additionalExercises.map((exercise, index) => (
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
                                  <Label>Chord</Label>
                                  <div className="font-medium">{exercise.parameters.chord || '-'}</div>
                                </div>
                                <div>
                                  <Label>MO</Label>
                                  <div className="font-medium">{exercise.parameters.mo || '-'}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Ideal Time</Label>
                                  <div className="font-medium">{exercise.parameters.idealTime || '-'}s</div>
                                </div>
                                <div>
                                  <Label>Penalty</Label>
                                  <div className="font-medium">
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
                  <div className="text-center py-8 text-muted-foreground">
                    No additional exercises added yet
                  </div>
                )}
                
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-4">Add New Exercise</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="exercise-name">Exercise Name</Label>
                        <Input 
                          id="exercise-name"
                          value={newExercise.name}
                          onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                          placeholder="e.g. Braking"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
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
                      <div className="space-y-4 border-t pt-4">
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
                              <Label htmlFor="chord">Chord</Label>
                              <Input
                                id="chord"
                                type="number"
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
                              <Label htmlFor="mo">MO</Label>
                              <Input
                                id="mo"
                                type="number"
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
                              <Label htmlFor="ideal-time">Ideal Time (seconds)</Label>
                              <Input
                                id="ideal-time"
                                type="number"
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
                                <Label htmlFor="penalty-value">Penalty Time (seconds)</Label>
                                <Input
                                  id="penalty-value"
                                  type="number"
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
                      className="w-full md:w-auto mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Exercise
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
