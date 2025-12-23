import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "@/modules/student/StudentDashboard";

export default function StudentPanelPage() {
  const { role } = useAuth();

  if (role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  // Reuse the full 4-block Student Dashboard layout as the Student Panel page
  return <StudentDashboard />;
}
