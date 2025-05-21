
import { useState, useMemo, useEffect } from "react";
import { ProgramExercise } from "@/types/programs";

interface ExercisesListProps {
  exercises: ProgramExercise[];
  onChange: (exercises: ProgramExercise[]) => void;
  measured: boolean;
}

// This component now operates in the background without UI
export function ExercisesList({ exercises, onChange, measured }: ExercisesListProps) {
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

  // Return null as this component no longer renders UI
  return null;
}
