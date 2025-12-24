import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SystemMonitoringPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
        <p className="text-muted-foreground text-sm">
          Central place for administrators to inspect evaluation activity and application errors.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Logs</CardTitle>
            <CardDescription>
              View recent grading runs, scores, and plagiarism indicators.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground max-w-xs">
              Use this stream during demos to explain how IntelliGrade AI evaluates each submission.
            </p>
            <Button asChild>
              <Link to="/admin/logs/evaluations">Open Evaluation Logs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Monitoring</CardTitle>
            <CardDescription>
              Inspect recent backend and grading errors captured for debugging.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground max-w-xs">
              Use this during hackathon judging to show reliability and how failures are tracked.
            </p>
            <Button variant="outline" asChild>
              <Link to="/admin/logs/errors">Open Error Logs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
