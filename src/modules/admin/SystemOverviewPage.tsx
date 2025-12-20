import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SystemOverviewPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [submissionCount, setSubmissionCount] = useState<number | null>(null);
  const [evaluationCount, setEvaluationCount] = useState<number | null>(null);
  const [avgPlagiarism, setAvgPlagiarism] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchStats();
  }, [role, navigate]);

  async function fetchStats() {
    try {
      const [{ count: submissions }, { count: evaluations }, plagiarismResult] = await Promise.all([
        supabase.from("submissions").select("id", { count: "exact", head: true }),
        supabase.from("grading_results").select("id", { count: "exact", head: true }),
        supabase
          .from("grading_results")
          .select("plagiarism_score")
          .not("plagiarism_score", "is", null),
      ]);

      setSubmissionCount(submissions ?? 0);
      setEvaluationCount(evaluations ?? 0);

      const scores = (plagiarismResult.data || []).map((r: any) => r.plagiarism_score as number);
      if (scores.length > 0) {
        const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
        setAvgPlagiarism(Math.round(avg));
      } else {
        setAvgPlagiarism(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Overview</h1>
        <p className="text-muted-foreground text-sm">
          High-level activity and evaluation metrics across IntelliGrade AI.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
            <CardDescription>All student reports in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "–" : submissionCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Evaluations</CardTitle>
            <CardDescription>Number of grading runs by the AI engine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "–" : evaluationCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Plagiarism Indicator</CardTitle>
            <CardDescription>Across all graded submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">
                {loading ? "–" : avgPlagiarism != null ? `${avgPlagiarism}%` : "N/A"}
              </div>
              {avgPlagiarism != null && (
                <Badge variant="secondary" className="text-xs">
                  Lower is better
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
