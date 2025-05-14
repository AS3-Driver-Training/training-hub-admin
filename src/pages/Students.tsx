
import { DashboardLayout } from "@/components/DashboardLayout";
import { StudentsManagement } from "@/components/students/StudentsManagement";
import { useEffect } from "react";
import { useNavigate, useLocation, Route, Routes } from "react-router-dom";

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to main students page if at /students
  useEffect(() => {
    if (location.pathname === "/students") {
      navigate("/students/list");
    }
  }, [location.pathname, navigate]);

  return (
    <DashboardLayout>
      <Routes>
        <Route path="list" element={<StudentsManagement />} />
      </Routes>
    </DashboardLayout>
  );
}
