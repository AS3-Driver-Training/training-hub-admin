
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProgramExercise } from "@/types/programs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2, AlertCircle } from "lucide-react";
import { ExerciseForm } from "./ExerciseForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExercisesListProps {
  exercises: ProgramExercise[];
  onChange: (exercises: ProgramExercise[]) => void;
  measured: boolean;
}

export function ExercisesList({ exercises, onChange, measured }: ExercisesListProps) {
  const [editingExercise, setEditingExercise] = useState<ProgramExercise | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<ProgramExercise | null>(null);

  // Core exercises that must be included for measured programs
  const coreExercises = useMemo(() => {
    const requiredExercises = [
      {
        id: "slalom",
        name: "Slalom",
        isCore: true,
        isMeasured: true,
        measurementType: "latacc" as const,
        order: 1,
        parameters: [] // We no longer set default parameters at program level
      },
      {
        id: "lane-change",
        name: "Lane Change",
        isCore: true,
        isMeasured: true,
        measurementType: "latacc" as const,
        order: 2,
        parameters: [] // We no longer set default parameters at program level
      },
      {
        id: "final-exercise",
        name: "Final Exercise",
        isCore: true,
        isMeasured: true,
        measurementType: "time" as const,
        order: 3,
        parameters: [] // We no longer set default parameters at program level
      }
    ];

    return requiredExercises;
  }, []);

  // Check if we need to add core exercises
  const existingCoreIds = useMemo(() => {
    return exercises
      .filter(ex => ex.isCore)
      .map(ex => ex.name.toLowerCase());
  }, [exercises]);

  // Get missing core exercises
  const missingCoreExercises = useMemo(() => {
    if (!measured) return [];
    
    return coreExercises.filter(
      core => !existingCoreIds.includes(core.name.toLowerCase())
    );
  }, [measured, coreExercises, existingCoreIds]);

  // Auto-add missing core exercises when program becomes measured
  useEffect(() => {
    if (measured && missingCoreExercises.length > 0) {
      // Add all missing core exercises automatically
      const updatedExercises = [...exercises];
      
      missingCoreExercises.forEach(coreExercise => {
        const newExercise = {
          ...coreExercise,
          id: `${coreExercise.id}-${Date.now()}`, // Ensure unique ID
          order: exercises.length + 1
        };
        updatedExercises.push(newExercise);
      });
      
      onChange(updatedExercises);
    }
  }, [measured, missingCoreExercises.length]);

  // Fixed: Use stopPropagation correctly to prevent click event bubbling
  const handleEditExercise = (e: React.MouseEvent, exercise: ProgramExercise) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
      e.preventDefault(); // Add preventDefault to be extra safe
    }
    setEditingExercise(exercise);
  };

  // Handle saving an exercise
  const handleSaveExercise = (savedExercise: ProgramExercise) => {
    const updatedExercises = editingExercise
      ? exercises.map(ex => (ex.id === editingExercise.id ? savedExercise : ex))
      : [...exercises, { ...savedExercise, order: exercises.length + 1 }];
    
    onChange(updatedExercises);
    setEditingExercise(null);
    setIsAddingExercise(false);
  };

  // Handle confirming deletion of an exercise
  const handleConfirmDelete = () => {
    if (exerciseToDelete) {
      const updatedExercises = exercises.filter(ex => ex.id !== exerciseToDelete.id);
      onChange(updatedExercises);
      setExerciseToDelete(null);
    }
  };

  // Calculate if core exercises are missing for measured programs
  const hasMissingCoreExercises = measured && missingCoreExercises.length > 0;

  return (
    <div className="space-y-4">
      {/* We'll still show the warning for transparency, but exercises should be auto-added now */}
      {hasMissingCoreExercises && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Adding Core Exercises</h4>
            <p className="text-sm text-yellow-700 mt-1">
              The required core exercises are being added automatically:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
              {missingCoreExercises.map(ex => (
                <li key={ex.id}>{ex.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {exercises.length > 0 && (
        <div className="space-y-2">
          {exercises.map(exercise => (
            <Card key={exercise.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{exercise.name}</h3>
                    <div className="flex gap-1">
                      {exercise.isCore && (
                        <Badge variant="secondary">Core</Badge>
                      )}
                      {exercise.isMeasured && (
                        <Badge>{exercise.measurementType === 'latacc' ? 'Lat Acc' : 'Time'}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Fix: Using the updated event handler and ensuring stopPropagation is applied */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingExercise(exercise);
                      }}
                      data-stop-propagation="true"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setExerciseToDelete(exercise);
                      }}
                      disabled={exercise.isCore && measured}
                      data-stop-propagation="true"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* We no longer display parameters at program level */}
                <div className="mt-2">
                  <h4 className="text-sm text-muted-foreground">
                    {exercise.measurementType === 'latacc' ? 'Lateral Acceleration' : 'Time'} Exercise
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Parameters will be set during course closure
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new exercise button */}
      {!isAddingExercise && !editingExercise && (
        <Button 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsAddingExercise(true);
          }}
          className="w-full"
          data-stop-propagation="true"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      )}

      {/* Exercise form for editing or adding */}
      {(isAddingExercise || editingExercise) && (
        <ExerciseForm
          exercise={editingExercise || undefined}
          isCore={editingExercise?.isCore || false}
          onSave={handleSaveExercise}
          onCancel={() => {
            setEditingExercise(null);
            setIsAddingExercise(false);
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!exerciseToDelete} onOpenChange={(open) => !open && setExerciseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exercise? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
