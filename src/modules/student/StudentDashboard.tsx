import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Award, TrendingUp, Download } from "lucide-react";
import UploadReport from "@/components/student/UploadReport";
import MySubmissions from "@/components/student/MySubmissions";
import GradingResults from "@/components/student/GradingResults";
import { toast } from "sonner";

 type LatestSubmission = {
  id: string;
  file_name: string;
  created_at: string;
  rubric_id: string | null;
 };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReview: 0,
    averageGrade: null as number | null,
  });
  const [latestSubmission, setLatestSubmission] = useState<LatestSubmission | null>(null);
  const [latestResult, setLatestResult] = useState<any | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchLatestGraded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchStats() {
    try {
      const { data: submissions } = await supabase
        .from("submissions")
        .select("status")
        .eq("student_id", user?.id);

      const total = submissions?.length || 0;
      const pending =
        submissions?.filter((s) => s.status === "pending" || s.status === "grading").length || 0;

      setStats({
        totalSubmissions: total,
        pendingReview: pending,
        averageGrade: null,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }

  async function fetchLatestGraded() {
    if (!user) return;
    setLoadingLatest(true);
    try {
      const { data: submissions, error } = await supabase
        .from("submissions")
        .select("id, file_name, created_at, rubric_id, status")
        .eq("student_id", user.id)
        .in("status", ["graded", "approved"])
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!submissions || submissions.length === 0) {
        setLatestSubmission(null);
        setLatestResult(null);
        return;
      }

      const latest = submissions[0] as LatestSubmission;
      setLatestSubmission(latest);

      const { data: result, error: resultError } = await supabase
        .from("grading_results")
        .select("*")
        .eq("submission_id", latest.id)
        .maybeSingle();

      if (resultError) {
        console.error("Failed to fetch latest grading result", resultError);
        setLatestResult(null);
        return;
      }

      setLatestResult(result);
    } catch (error) {
      console.error("Failed to fetch latest graded submission", error);
      setLatestSubmission(null);
      setLatestResult(null);
    } finally {
      setLoadingLatest(false);
    }
  }

  async function handleDownloadLatestReport() {
    if (!latestSubmission || !latestResult) {
      toast.error("No graded submission available to download yet");
      return;
    }

    try {
      const doc = new jsPDF();
      const left = 14;
      let y = 20;

      doc.setFontSize(18);
      doc.text("IntelliGrade AI - Score Report", left, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Submission: ${latestSubmission.file_name}`, left, y);
      y += 6;
      doc.text(
        `Submitted on: ${new Date(latestSubmission.created_at).toLocaleString()}`,
        left,
        y,
      );
      y += 8;

      const totalMax = latestResult.total_max_marks;
      const finalTotal =
        latestResult.is_final_approved && latestResult.final_total_marks != null
          ? latestResult.final_total_marks
          : latestResult.total_marks_awarded;

      doc.text(`Score: ${finalTotal}/${totalMax}`, left, y);
      y += 8;

      if (latestResult.final_overall_feedback || latestResult.overall_feedback) {
        doc.setFontSize(14);
        doc.text("Overall Feedback", left, y);
        y += 6;
        doc.setFontSize(12);
        const overall = latestResult.final_overall_feedback || latestResult.overall_feedback;
        const split = doc.splitTextToSize(overall, 180);
        doc.text(split, left, y);
        y += split.length * 6 + 4;
      }

      const sections =
        latestResult.is_final_approved && latestResult.final_section_grades
          ? latestResult.final_section_grades
          : latestResult.section_grades;

      doc.setFontSize(14);
      doc.text("Section-wise Marks & Feedback", left, y);
      y += 8;
      doc.setFontSize(12);

      sections.forEach((section: any, index: number) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.text(
          `${index + 1}. ${section.section_name} - ${section.marks_awarded}/${section.max_marks}`,
          left,
          y,
        );
        y += 6;

        if (section.feedback) {
          const feedbackLines = doc.splitTextToSize(section.feedback, 180);
          doc.text(feedbackLines, left, y);
          y += feedbackLines.length * 6 + 2;
        }

        if (section.similarity_score != null) {
          doc.text(`Rubric match: ${section.similarity_score}%`, left, y);
          y += 6;
        }

        y += 2;
      });

      doc.save(`intelligrade-report-${latestSubmission.id}.pdf`);
      toast.success("Result report downloaded");
    } catch (error) {
      console.error("Failed to generate PDF", error);
      toast.error("Failed to generate PDF report");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-1">Student Panel</h1>
          <p className="text-muted-foreground text-sm">
            Submit report → Receive marks → Understand feedback.
          </p>
        </div>

        {/* Linear 3-step flow: Upload → Processing → Results */}
        <nav aria-label="Submission progress" className="rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Your 3-step journey
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <ol className="flex-1 grid gap-3 md:grid-cols-3 text-sm">
              {[1, 2, 3].map((step) => {
                const currentStep = !stats.totalSubmissions
                  ? 1
                  : stats.pendingReview > 0 && !latestResult
                    ? 2
                    : latestSubmission && latestResult
                      ? 3
                      : 2;
                const isComplete = currentStep > step;
                const isActive = currentStep === step;
                const label =
                  step === 1
                    ? "Upload report"
                    : step === 2
                      ? "Processing & grading"
                      : "Results & feedback";
                const description =
                  step === 1
                    ? "Upload your PDF/DOCX file."
                    : step === 2
                      ? "System evaluates your work and teacher reviews."
                      : "See marks, section-wise scores, and feedback.";

                return (
                  <li
                    key={step}
                    className="flex items-start gap-3 hover-scale transition-colors"
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                        isComplete
                          ? "bg-primary text-primary-foreground border-primary"
                          : isActive
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {step}
                    </div>
                    <div className="space-y-0.5">
                      <p
                        className={`text-xs font-medium ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Simple progress bar */}
            <div className="mt-2 md:mt-0 w-full md:w-40">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${
                    (!stats.totalSubmissions ? 1 : stats.pendingReview > 0 && !latestResult ? 2 : latestSubmission && latestResult ? 3 : 2) /
                    3 *
                    100
                  }%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Step
                {
                  !stats.totalSubmissions
                    ? " 1 of 3"
                    : stats.pendingReview > 0 && !latestResult
                      ? " 2 of 3"
                      : latestSubmission && latestResult
                        ? " 3 of 3"
                        : " 2 of 3"
                }
              </p>
            </div>
          </div>
        </nav>
      </div>

      {/* Dashboard / Submission Status */}
      <section aria-label="Submission status" className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Dashboard / Submission Status
          </h2>
          <p className="text-xs text-muted-foreground">
            Quick overview of how many reports you’ve submitted and what’s still under review.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">Total reports uploaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageGrade ? `${stats.averageGrade}%` : "--"}
              </div>
              <p className="text-xs text-muted-foreground">Across all submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">Awaiting teacher approval</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Report Submission */}
      <section className="space-y-4" aria-label="Report submission">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Report Submission
          </h2>
          <p className="text-xs text-muted-foreground">
            Upload your PDF/DOCX. After submission, you’ll see its status move from Pending → Graded
            → Approved.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2" id="upload-report">
          <UploadReport />
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">My Submissions</h3>
                <p className="text-xs text-muted-foreground">
                  This list shows all your uploads with live status so you always know what the system
                  is doing.
                </p>
              </div>
            </div>
            <MySubmissions />
          </div>
        </div>
      </section>

      {/* Evaluation Results for latest graded submission */}
      <section className="space-y-4" aria-label="Evaluation results">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Evaluation Results (Latest Graded Submission)
          </h2>
          <p className="text-xs text-muted-foreground">
            When at least one of your reports has been graded, you’ll see Total Marks, Structure
            Score, Keyword Score, Concept Accuracy Score, and Feedback Summary here.
          </p>
        </div>
        {loadingLatest ? (
          <Card>
            <CardContent className="p-6 text-xs text-muted-foreground">
              Loading latest graded submission...
            </CardContent>
          </Card>
        ) : latestSubmission && latestResult ? (
          <GradingResults submissionId={latestSubmission.id} />
        ) : (
          <Card>
            <CardContent className="p-6 text-xs text-muted-foreground">
              No graded submissions yet. Once your first report is graded, its Evaluation Results will
              appear here.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Download Result Report (PDF) */}
      <section className="space-y-3" aria-label="Download result report">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Download
          </h2>
          <p className="text-xs text-muted-foreground">
            Download the Result Report (PDF) for your latest graded submission, including marks,
            breakdown, and feedback.
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="text-xs text-muted-foreground">
              {latestSubmission && latestResult ? (
                <>
                  <p className="font-medium text-foreground text-sm">
                    {latestSubmission.file_name}
                  </p>
                  <p>
                    Graded on {new Date(latestResult.created_at).toLocaleString()} — ready to
                    download.
                  </p>
                </>
              ) : (
                <p>
                  No graded submission available yet. Upload a report and wait for it to be graded to
                  enable download.
                </p>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!latestSubmission || !latestResult}
              onClick={handleDownloadLatestReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Result Report (PDF)
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
