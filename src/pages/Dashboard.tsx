import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/modules/admin/AdminDashboard";
import TeacherDashboard from "@/modules/teacher/TeacherDashboard";
import StudentDashboard from "@/modules/student/StudentDashboard";

export default function Dashboard() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role === "admin") return <AdminDashboard />;
  if (role === "teacher") return <TeacherDashboard />;
  if (role === "student") return <StudentDashboard />;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">No role assigned. Contact admin.</p>
    </div>
  );
}
