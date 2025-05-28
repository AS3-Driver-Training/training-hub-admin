
import { useEffect } from "react";
import { useWizardContext } from "../WizardContext";
import { useEnrolledStudents } from "../../hooks/useEnrolledStudents";

/**
 * Hook to fetch and manage student data for course closure
 */
export const useStudentData = (courseId?: number) => {
  const { updateFormData } = useWizardContext();
  const { students, isLoading, error, getStudentsForClosure } = useEnrolledStudents(courseId);

  // Update form data with students when they are loaded
  useEffect(() => {
    if (!isLoading && students.length > 0) {
      const studentsForClosure = getStudentsForClosure();
      console.log("Updating form data with students:", studentsForClosure);
      updateFormData({ students: studentsForClosure });
    }
  }, [students, isLoading, getStudentsForClosure, updateFormData]);

  return {
    students,
    isLoading,
    error,
    studentsForClosure: getStudentsForClosure()
  };
};
