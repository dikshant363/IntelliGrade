import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MySubmissions from "@/components/student/MySubmissions";

export default function MySubmissionsPage() {
  const { role } = useAuth();

  if (role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">My Submissions</h1>
        <p className="text-muted-foreground text-sm">
          View and download your uploaded reports and track their grading status.
        </p>
      </header>
      <section aria-label="My submissions list">
        <MySubmissions />
      </section>
    </div>
  );
}
