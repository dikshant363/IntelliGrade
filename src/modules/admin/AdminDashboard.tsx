import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Settings, Activity, BarChart2, ClipboardList } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System oversight and configuration</p>
      </div>

      {/* IA flow: System oversight → Consistency → Control */}
      <section aria-label="Admin workflow overview" className="rounded-lg border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          System oversight · Consistency · Control
        </p>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div>
            <p className="font-medium">1. System overview</p>
            <p className="text-muted-foreground">
              Track submissions, evaluations, and plagiarism indicators at a high level.
            </p>
          </div>
          <div>
            <p className="font-medium">2. User &amp; rubric governance</p>
            <p className="text-muted-foreground">
              Manage teacher/student accounts and review active grading rubrics.
            </p>
          </div>
          <div>
            <p className="font-medium">3. Monitoring &amp; logs</p>
            <p className="text-muted-foreground">
              Inspect evaluation and error logs to keep IntelliGrade AI healthy and auditable.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard · System Usage Summary & Admin Tools */}
      <section aria-label="Admin tools" className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Admin Tools
          </h2>
          <p className="text-xs text-muted-foreground">
            Jump to the main areas for user management, system metrics, configuration, and logs.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-scale cursor-pointer" onClick={() => navigate("/admin/users")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create teacher/student accounts, assign roles, and deactivate users.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer"
            onClick={() => navigate("/admin/system-overview")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Overview</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                See total submissions, evaluations, and plagiarism indicators.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer"
            onClick={() => navigate("/admin/evaluation-config")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluation Configuration</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configure grading thresholds, weights, and allowed file formats.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer"
            onClick={() => navigate("/admin/logs/evaluations")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports &amp; Logs</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Inspect evaluation history and error logs for debugging.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Jump directly to key admin tools</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="underline text-primary"
            onClick={() => navigate("/admin/logs/evaluations")}
          >
            Evaluation logs
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            className="underline text-primary"
            onClick={() => navigate("/admin/logs/errors")}
          >
            Error logs
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
