
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CourseClosureForm } from "@/components/course-closure/CourseClosureForm";

export default function CourseClosure() {
  const { id } = useParams<{ id: string }>();
  const courseId = id ? parseInt(id) : undefined;

  if (!courseId) {
    return <div>Invalid course ID</div>;
  }

  return (
    <DashboardLayout>
      <CourseClosureForm courseInstanceId={courseId} />
    </DashboardLayout>
  );
}
