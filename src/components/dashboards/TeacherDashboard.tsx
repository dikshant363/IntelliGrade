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
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
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

  async function handleDemoMode() {
    try {
      // Prefer an approved submission for demo; fall back to graded
      const { data: approved, error: approvedError } = await supabase
        .from("submissions")
        .select("id, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (approvedError) {
        console.error("Error loading approved demo submission", approvedError);
      }

      let target = approved;

      if (!target) {
        const { data: graded, error: gradedError } = await supabase
          .from("submissions")
          .select("id, created_at")
          .eq("status", "graded")
          .order("created_at", { ascending: false })
          .maybeSingle();

        if (gradedError) {
          console.error("Error loading graded demo submission", gradedError);
        }

        target = graded;
      }

      if (!target) {
        toast.info("No graded or approved submissions yet. Run grading once, then try Demo Mode again.");
        return;
      }

      navigate(`/submissions/${target.id}`);
    } catch (error) {
      console.error("Demo mode navigation error", error);
      toast.error("Could not open demo submission");
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
        <Button variant="outline" size="sm" onClick={handleDemoMode}>
          Demo Mode: Jump to graded example
        </Button>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rubric Management</CardTitle>
            <CardDescription>Create and manage grading criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Rubric creation interface will be implemented in Phase 4
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>Review AI-graded reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Submission review interface will be implemented in Phase 3
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
