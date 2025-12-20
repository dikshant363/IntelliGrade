import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardList, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SubmissionSummary = {
  pending: number;
  grading: number;
  graded: number;
  approved: number;
  total: number;
};

export default function TeacherDashboard() {
  const [summary, setSummary] = useState<SubmissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();

    const seen = localStorage.getItem("intelligrade-teacher-onboarding-dismissed");
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

  async function fetchSummary() {
    try {
      const statuses = ["pending", "grading", "graded", "approved"] as const;

      const results = await Promise.all(
        statuses.map((status) =>
          supabase
            .from("submissions")
            .select("id", { count: "exact", head: true })
            .eq("status", status)
        )
      );

      const counts: Record<string, number> = {};
      statuses.forEach((status, index) => {
        counts[status] = results[index].count ?? 0;
      });

      const total = statuses.reduce((sum, status) => sum + counts[status], 0);

      setSummary({
        pending: counts.pending,
        grading: counts.grading,
        graded: counts.graded,
        approved: counts.approved,
        total,
      });
    } catch (error) {
      console.error("Failed to load submission summary", error);
      toast.error("Failed to load submission summary");
    } finally {
      setLoading(false);
    }
  }

  const pendingOrGrading = summary ? summary.pending + summary.grading : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Academic control and grading oversight</p>
        </div>
        <div className="flex flex-col items-end gap-1" />
      </div>

      {showOnboarding && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Welcome, teacher</CardTitle>
            <CardDescription>How to grade and approve reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1">
              <li>Ask students to upload reports from their Student dashboard.</li>
              <li>
                Open <span className="font-medium">Student Submissions</span> and filter to
                pending or graded.
              </li>
              <li>
                Click a submission to open the detail view, then run AI grading to generate
                section-wise marks and feedback.
              </li>
              <li>
                Review the AI result, adjust scores if needed, and click approve to finalize the
                grade.
              </li>
            </ol>
            <p className="text-xs">
              Once approved, students can see their final marks, feedback, and download their
              report summary.
            </p>
            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  localStorage.setItem(
                    "intelligrade-teacher-onboarding-dismissed",
                    "true",
                  );
                  setShowOnboarding(false);
                }}
              >
                Got it
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="hover-scale cursor-pointer"
          onClick={() => navigate("/submissions?status=pendingOrGrading")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending / In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "–" : pendingOrGrading}
            </div>
            <p className="text-xs text-muted-foreground">Reports awaiting AI grading or review</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "–" : summary?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">All student reports in the system</p>
          </CardContent>
        </Card>

        <Card
          className="hover-scale cursor-pointer"
          onClick={() => navigate("/submissions?status=graded")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded (awaiting approval)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "–" : summary?.graded ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">AI-graded, not yet finalized</p>
          </CardContent>
        </Card>

        <Card
          className="hover-scale cursor-pointer"
          onClick={() => navigate("/submissions?status=approved")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "–" : summary?.approved ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Teacher-approved final grades</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Rubric Management</CardTitle>
            <CardDescription>Create and manage grading criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Define reusable grading templates and section-wise maximum marks for AI-assisted
              evaluation.
            </p>
            <Button size="sm" onClick={() => navigate("/rubrics")}>
              Go to Rubrics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>Review AI-graded reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Browse pending, graded, and approved reports. Run AI grading and finalize marks.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/submissions")}>
              View Submissions
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Class Analytics</CardTitle>
            <CardDescription>See score bands and export CSV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Open the analytics view to see how your class is performing overall and export a
              CSV of recent results.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/teacher/analytics")}>
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

