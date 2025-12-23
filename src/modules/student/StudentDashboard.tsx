import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, TrendingUp } from "lucide-react";
import UploadReport from "@/components/student/UploadReport";
import MySubmissions from "@/components/student/MySubmissions";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReview: 0,
    averageGrade: null as number | null,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    try {
      const { data: submissions } = await supabase
        .from("submissions")
        .select("status")
        .eq("student_id", user?.id);

      const total = submissions?.length || 0;
      const pending = submissions?.filter((s) => s.status === "pending" || s.status === "grading").length || 0;

      setStats({
        totalSubmissions: total,
        pendingReview: pending,
        averageGrade: null, // Will be calculated after grading is implemented
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold mb-1">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Submit your report, track grading status, and understand AI feedback.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            One clear flow
          </p>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div>
              <p className="font-medium">1. Submit report</p>
              <p className="text-muted-foreground">Upload your PDF/DOCX using the form below.</p>
            </div>
            <div>
              <p className="font-medium">2. Receive marks</p>
              <p className="text-muted-foreground">Watch your submission move from pending to graded.</p>
            </div>
            <div>
              <p className="font-medium">3. Understand feedback</p>
              <p className="text-muted-foreground">Review section-wise scores and download the full report.</p>
            </div>
          </div>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-2" id="upload-report">
        <UploadReport />
        <div className="lg:col-span-2">
          <MySubmissions />
        </div>
      </div>
    </div>
  );
}
