import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";

 type Submission = {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  student_id: string;
  is_demo?: boolean;
 };

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  grading: "Grading",
  graded: "Graded (awaiting approval)",
  approved: "Approved",
};

export default function Submissions() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const statusFilter = searchParams.get("status") ?? "all";
  const demoFilter = searchParams.get("demo") ?? "all";

  useEffect(() => {
    if (role !== "teacher" && role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, statusFilter, demoFilter]);

  async function fetchSubmissions() {
    try {
      let query = supabase
        .from("submissions")
        .select("id, file_name, status, created_at, student_id")
        .order("created_at", { ascending: false });

      if (statusFilter === "pendingOrGrading") {
        query = query.in("status", ["pending", "grading"]);
      } else if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const normalized = (data || []).map((submission) => ({
        ...submission,
        is_demo: submission.file_name.startsWith("Demo "),
      }));

      setSubmissions(normalized);
    } catch (error: any) {
      console.error("Failed to load submissions", error);
      toast.error("Failed to load submissions: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const titleByFilter: Record<string, string> = {
    all: "All Submissions",
    pending: "Pending Submissions",
    grading: "Submissions In Grading",
    graded: "Graded (Awaiting Approval)",
    approved: "Approved Submissions",
    pendingOrGrading: "Pending / In Progress Submissions",
  };

  const title = titleByFilter[statusFilter] ?? "Submissions";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground text-sm">
            Click a submission to open full grading details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <select
            className="border border-input bg-background text-xs rounded-md px-2 py-1"
            value={demoFilter}
            onChange={(e) =>
              navigate(
                `/teacher/submissions?status=${statusFilter}&demo=${e.target.value}`,
              )
            }
          >
            <option value="all">All data</option>
            <option value="demo">Demo only</option>
            <option value="real">Real only</option>
          </select>
          {statusFilter !== "all" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/teacher/submissions")}
            >
              Clear filter
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No submissions found for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className="hover-scale cursor-pointer"
              onClick={() => navigate(`/teacher/submissions/${submission.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {submission.file_name}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <Badge variant={submission.status === "approved" ? "default" : "secondary"}>
                    {STATUS_LABELS[submission.status] ?? submission.status}
                  </Badge>
                  {submission.is_demo && (
                    <span className="text-[10px] text-muted-foreground">Demo data</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <span>
                    Submitted on {new Date(submission.created_at).toLocaleString()}
                  </span>
                  <span className="block">Student ID: {submission.student_id}</span>
                  {submission.is_demo && (
                    <span className="block text-[10px] text-muted-foreground/80">
                      This is seeded demo data for showcasing IntelliGrade AI.
                    </span>
                  )}
                </div>
                {(submission.status === "pending" || submission.status === "graded") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-[11px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/submissions/${submission.id}`);
                    }}
                  >
                    Grade with AI
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
