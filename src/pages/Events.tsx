
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TrainingEvents } from "@/components/events/TrainingEvents";
import { CourseInstanceForm } from "@/components/events/CourseInstanceForm";
import { CourseAllocations } from "@/components/events/CourseAllocations";

export default function Events() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<TrainingEvents />} />
        <Route path="/create" element={<CourseInstanceForm />} />
        <Route path="/:id/edit" element={<CourseInstanceForm />} />
        <Route path="/:id/allocations" element={<CourseAllocations />} />
      </Routes>
    </DashboardLayout>
  );
}
