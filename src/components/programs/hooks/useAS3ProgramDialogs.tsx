
import { useState } from "react";
import { ProgramWithInstances, CourseInstance } from "./useAS3Programs";

export function useAS3ProgramDialogs() {
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithInstances | null>(null);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<CourseInstance | null>(null);

  const handleInquiry = (program: ProgramWithInstances) => {
    setSelectedProgram(program);
    setInquiryDialogOpen(true);
  };

  const handleEnrollment = (program: ProgramWithInstances, instance: CourseInstance) => {
    setSelectedProgram(program);
    setSelectedInstance(instance);
    setEnrollmentDialogOpen(true);
  };

  const closeInquiryDialog = () => {
    setInquiryDialogOpen(false);
    setSelectedProgram(null);
  };

  const closeEnrollmentDialog = () => {
    setEnrollmentDialogOpen(false);
    setSelectedProgram(null);
    setSelectedInstance(null);
  };

  return {
    selectedProgram,
    selectedInstance,
    inquiryDialogOpen,
    enrollmentDialogOpen,
    handleInquiry,
    handleEnrollment,
    closeInquiryDialog,
    closeEnrollmentDialog,
  };
}
