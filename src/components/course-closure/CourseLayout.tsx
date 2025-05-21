
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseLayout as CourseLayoutType } from "@/types/programs";

interface CourseLayoutProps {
  layout: CourseLayoutType;
  onChange: (layout: Partial<CourseLayoutType>) => void;
}

export function CourseLayout({ layout, onChange }: CourseLayoutProps) {
  const handleSlalomChange = (field: keyof typeof layout.slalom, value: string) => {
    onChange({
      slalom: {
        ...layout.slalom,
        [field]: parseFloat(value) || 0
      }
    });
  };

  const handleLaneChangeChange = (field: keyof typeof layout.lane_change, value: string) => {
    onChange({
      lane_change: {
        ...layout.lane_change,
        [field]: parseFloat(value) || 0
      }
    });
  };

  const handleFinalExerciseChange = (field: keyof typeof layout.final_exercise, value: any) => {
    onChange({
      final_exercise: {
        ...layout.final_exercise,
        [field]: typeof value === 'string' ? (parseFloat(value) || 0) : value
      }
    });
  };

  const handleFinalSlalomChange = (field: keyof typeof layout.final_exercise.slalom, value: string) => {
    onChange({
      final_exercise: {
        ...layout.final_exercise,
        slalom: {
          ...layout.final_exercise.slalom,
          [field]: parseFloat(value) || 0
        }
      }
    });
  };

  const handleFinalLaneChangeChange = (field: keyof typeof layout.final_exercise.lane_change, value: string) => {
    onChange({
      final_exercise: {
        ...layout.final_exercise,
        lane_change: {
          ...layout.final_exercise.lane_change,
          [field]: parseFloat(value) || 0
        }
      }
    });
  };

  return (
    <div className="grid gap-6">
      <h3 className="text-lg font-semibold">Course Layout</h3>
      
      <Tabs defaultValue="slalom">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="slalom">Slalom</TabsTrigger>
          <TabsTrigger value="lanechange">Lane Change</TabsTrigger>
          <TabsTrigger value="final">Final Exercise</TabsTrigger>
        </TabsList>
        
        <TabsContent value="slalom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="grid gap-2">
              <Label htmlFor="slalom-chord">Chord (ft/m)</Label>
              <Input
                id="slalom-chord"
                type="number"
                value={layout.slalom.chord}
                onChange={(e) => handleSlalomChange('chord', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="slalom-mo">Maximum Offset (ft/m)</Label>
              <Input
                id="slalom-mo"
                type="number"
                value={layout.slalom.mo}
                onChange={(e) => handleSlalomChange('mo', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="lanechange">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="grid gap-2">
              <Label htmlFor="lanechange-chord">Chord (ft/m)</Label>
              <Input
                id="lanechange-chord"
                type="number"
                value={layout.lane_change.chord}
                onChange={(e) => handleLaneChangeChange('chord', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lanechange-mo">Maximum Offset (ft/m)</Label>
              <Input
                id="lanechange-mo"
                type="number"
                value={layout.lane_change.mo}
                onChange={(e) => handleLaneChangeChange('mo', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="final">
          <div className="grid gap-6 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="final-ideal-time">Ideal Time (sec)</Label>
                <Input
                  id="final-ideal-time"
                  type="number"
                  step="0.1"
                  value={layout.final_exercise.ideal_time_sec}
                  onChange={(e) => handleFinalExerciseChange('ideal_time_sec', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="final-cone-penalty">Cone Penalty (sec)</Label>
                <Input
                  id="final-cone-penalty"
                  type="number"
                  step="0.1"
                  value={layout.final_exercise.cone_penalty_sec}
                  onChange={(e) => handleFinalExerciseChange('cone_penalty_sec', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="final-door-penalty">Door Penalty (sec)</Label>
                <Input
                  id="final-door-penalty"
                  type="number"
                  step="0.1"
                  value={layout.final_exercise.door_penalty_sec}
                  onChange={(e) => handleFinalExerciseChange('door_penalty_sec', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="final-reverse-time">Reverse Time (sec)</Label>
              <Input
                id="final-reverse-time"
                type="number"
                step="0.1"
                value={layout.final_exercise.reverse_time || 0}
                onChange={(e) => handleFinalExerciseChange('reverse_time', e.target.value)}
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Slalom Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="final-slalom-chord">Chord (ft/m)</Label>
                  <Input
                    id="final-slalom-chord"
                    type="number"
                    value={layout.final_exercise.slalom.chord}
                    onChange={(e) => handleFinalSlalomChange('chord', e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="final-slalom-mo">Maximum Offset (ft/m)</Label>
                  <Input
                    id="final-slalom-mo"
                    type="number"
                    value={layout.final_exercise.slalom.mo}
                    onChange={(e) => handleFinalSlalomChange('mo', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Lane Change Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="final-lanechange-chord">Chord (ft/m)</Label>
                  <Input
                    id="final-lanechange-chord"
                    type="number"
                    value={layout.final_exercise.lane_change.chord}
                    onChange={(e) => handleFinalLaneChangeChange('chord', e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="final-lanechange-mo">Maximum Offset (ft/m)</Label>
                  <Input
                    id="final-lanechange-mo"
                    type="number"
                    value={layout.final_exercise.lane_change.mo}
                    onChange={(e) => handleFinalLaneChangeChange('mo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
