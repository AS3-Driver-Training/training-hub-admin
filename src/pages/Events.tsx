
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TrainingEvents } from "@/components/events/TrainingEvents";
import { CourseInstanceForm } from "@/components/events/CourseInstanceForm";
import { CourseAllocations } from "@/components/events/CourseAllocations";
import { CourseClosure } from "@/components/events/CourseClosure";
import AnalyticsReport from "./AnalyticsReport";
import { ClosedCourseRedirect } from "@/components/events/ClosedCourseRedirect";

export default function Events() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<TrainingEvents />} />
        <Route path="/create" element={<CourseInstanceForm />} />
        <Route path="/:id" element={<ClosedCourseRedirect />} />
        <Route path="/:id/manage" element={<CourseAllocations />} />
        <Route path="/:id/edit" element={<CourseInstanceForm />} />
        <Route path="/:id/close" element={<CourseClosure />} />
        <Route path="/:id/analytics" element={<AnalyticsReport />} />
      </Routes>
    </DashboardLayout>
  );
}
