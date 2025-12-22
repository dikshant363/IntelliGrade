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
          <span className="text-muted-foreground">•</span>
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
