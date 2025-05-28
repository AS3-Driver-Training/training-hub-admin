
import { useEffect } from "react";
import { useCourseInstance } from "./useCourseInstance";
import { useExistingClosure } from "./useExistingClosure";
import { useClosureMutations } from "./useClosureMutations";
import { useStudentData } from "./useStudentData";

/**
 * Main hook that combines course instance data, existing closures, student data, and mutations
 */
export const useCourseData = (courseId?: number) => {
  const { courseInstance, isLoading, error, initializeCourseData } = useCourseInstance(courseId);
  const { existingClosure, handleExistingClosureData } = useExistingClosure(courseId);
  const { submitMutation, updateMutation } = useClosureMutations(courseId);
  const { studentsForClosure } = useStudentData(courseId);

  // Initialize form data when course instance is loaded
  useEffect(() => {
    initializeCourseData();
  }, [courseInstance]);

  // Set to completed step if there's already a closure
  useEffect(() => {
    if (existingClosure) {
      handleExistingClosureData();
    }
  }, [existingClosure]);

  return {
    courseInstance,
    isLoading,
    error,
    submitMutation,
    updateMutation
  };
};
