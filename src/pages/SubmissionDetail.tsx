import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, FileText, Loader2, Sparkles } from "lucide-react";
import GradingResults from "@/components/student/GradingResults";

type Submission = {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  rubric_id: string | null;
};

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  async function fetchSubmission() {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setSubmission(data);
    } catch (error: any) {
      toast.error("Failed to load submission");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleGrade() {
    if (!submission || !submission.rubric_id) {
      toast.error("No rubric assigned to this submission");
      return;
    }

    setGrading(true);

    try {
      const { data, error } = await supabase.functions.invoke("grade-submission", {
        body: { submission_id: submission.id },
      });

      if (error) throw error;

      toast.success("Grading completed successfully!");
      fetchSubmission();
    } catch (error: any) {
      console.error("Grading error:", error);
      toast.error("Failed to grade submission: " + error.message);
    } finally {
      setGrading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  const canGrade =
    role === "teacher" &&
    submission.rubric_id &&
    (submission.status === "pending" || submission.status === "grading");

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Submission Details</h1>
          <p className="text-muted-foreground">View report and grading results</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {submission.file_name}
              </CardTitle>
              <CardDescription>
                Submitted on {new Date(submission.created_at).toLocaleString()}
              </CardDescription>
            </div>
            <Badge variant={submission.status === "approved" ? "default" : "secondary"}>
              {submission.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {canGrade && (
            <Button onClick={handleGrade} disabled={grading} className="w-full mb-4">
              {grading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Grading in progress...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Grade with AI
                </>
              )}
            </Button>
          )}

          {!submission.rubric_id && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                No rubric assigned. Teacher must assign a rubric before grading.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {(submission.status === "graded" || submission.status === "approved") && (
        <GradingResults submissionId={submission.id} />
      )}
    </div>
  );
}
