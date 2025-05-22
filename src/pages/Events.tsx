
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TrainingEvents } from "@/components/events/TrainingEvents";
import { CourseInstanceForm } from "@/components/events/CourseInstanceForm";
import { CourseAllocations } from "@/components/events/CourseAllocations";
import { CourseClosure } from "@/components/events/CourseClosure";

export default function Events() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<TrainingEvents />} />
        <Route path="/create" element={<CourseInstanceForm />} />
        <Route path="/:id" element={<CourseAllocations />} />
        <Route path="/:id/edit" element={<CourseInstanceForm />} />
        <Route path="/:id/allocations" element={<CourseAllocations />} />
        <Route path="/:id/close" element={<CourseClosure />} />
      </Routes>
    </DashboardLayout>
  );
}
