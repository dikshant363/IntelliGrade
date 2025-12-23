import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function MySubmissionsPage() {
  const { role } = useAuth();

  if (role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  // My Submissions page is now merged into the main Student Panel.
  // Redirect students to the consolidated 4-block panel page.
  return <Navigate to="/student/panel" replace />;
}

