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
  const [gradingResult, setGradingResult] = useState<any | null>(null);
  const [overrideSections, setOverrideSections] = useState<any[] | null>(null);
  const [overrideOverall, setOverrideOverall] = useState<string>("");
  const [savingOverrides, setSavingOverrides] = useState(false);

  const isTeacher = role === "teacher" || role === "admin";

  useEffect(() => {
    if (id) {
      fetchSubmission();
      fetchGradingResult();
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

  async function fetchGradingResult() {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("grading_results")
        .select("*")
        .eq("submission_id", id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load grading result", error);
        return;
      }

      if (data) {
        setGradingResult(data);
        const baseSections = (data.final_section_grades as any[]) || (data.section_grades as any[]);
        setOverrideSections(baseSections?.map((s) => ({ ...s })) || null);
        setOverrideOverall(data.final_overall_feedback || data.overall_feedback || "");
      }
    } catch (error: any) {
      console.error("Error loading grading result", error);
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
      fetchGradingResult();
    } catch (error: any) {
      console.error("Grading error:", error);
      toast.error("Failed to grade submission: " + error.message);
    } finally {
      setGrading(false);
    }
  }

  async function handleSaveOverrides(approve: boolean) {
    if (!gradingResult || !overrideSections || !submission || !user) return;

    const total = overrideSections.reduce(
      (sum, s) => sum + (Number(s.marks_awarded) || 0),
      0
    );

    setSavingOverrides(true);
    try {
      const { error } = await supabase
        .from("grading_results")
        .update({
          final_section_grades: overrideSections,
          final_total_marks: total,
          final_overall_feedback: overrideOverall || gradingResult.overall_feedback,
          is_final_approved: approve,
          final_approved_by: approve ? user.id : gradingResult.final_approved_by,
          final_approved_at: approve ? new Date().toISOString() : gradingResult.final_approved_at,
        })
        .eq("id", gradingResult.id);

      if (error) throw error;

      if (approve) {
        const { error: statusError } = await supabase
          .from("submissions")
          .update({ status: "approved" })
          .eq("id", submission.id);

        if (statusError) throw statusError;
      }

      toast.success(approve ? "Final grade approved" : "Overrides saved");
      fetchSubmission();
      fetchGradingResult();
    } catch (error: any) {
      console.error("Override save error", error);
      toast.error("Failed to save overrides: " + error.message);
    } finally {
      setSavingOverrides(false);
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
    isTeacher &&
    submission.rubric_id &&
    (submission.status === "pending" || submission.status === "grading");

  const canReviewOverrides =
    isTeacher &&
    gradingResult &&
    (submission.status === "graded" || submission.status === "approved");

  const isAlreadyApproved = gradingResult?.is_final_approved;

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
        <>
          <GradingResults submissionId={submission.id} />

          {canReviewOverrides && overrideSections && (
            <Card>
              <CardHeader>
                <CardTitle>Teacher Review &amp; Overrides</CardTitle>
                <CardDescription>
                  Adjust marks or feedback and optionally approve the final grade.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground mb-2">
                  AI suggested {gradingResult.total_marks_awarded}/{gradingResult.total_max_marks}.
                  You can adjust section marks below; totals will be recalculated automatically.
                </div>

                {overrideSections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{section.section_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Max marks: {section.max_marks}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Final marks</span>
                        <input
                          type="number"
                          min={0}
                          max={section.max_marks}
                          value={section.marks_awarded}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setOverrideSections((prev) => {
                              if (!prev) return prev;
                              const next = [...prev];
                              next[index] = {
                                ...next[index],
                                marks_awarded: isNaN(value) ? 0 : Math.min(Math.max(value, 0), section.max_marks),
                              };
                              return next;
                            });
                          }}
                          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-right text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Feedback shown to student</p>
                      <textarea
                        value={section.feedback || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setOverrideSections((prev) => {
                            if (!prev) return prev;
                            const next = [...prev];
                            next[index] = {
                              ...next[index],
                              feedback: value,
                            };
                            return next;
                          });
                        }}
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Overall feedback (optional override)</p>
                  <textarea
                    value={overrideOverall}
                    onChange={(e) => setOverrideOverall(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 mt-2">
                  <div className="text-xs text-muted-foreground">
                    {isAlreadyApproved
                      ? "This grade has been approved. Changes here will update the final record."
                      : "You can save overrides as a draft or approve the final grade."}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={savingOverrides}
                      onClick={() => handleSaveOverrides(false)}
                    >
                      Save overrides
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={savingOverrides}
                      onClick={() => handleSaveOverrides(true)}
                    >
                      {isAlreadyApproved ? "Update approved grade" : "Approve final grade"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
