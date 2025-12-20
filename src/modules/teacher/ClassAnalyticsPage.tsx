import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GradingRow {
  id: string;
  created_at: string;
  total_marks_awarded: number;
  final_total_marks: number | null;
  total_max_marks: number;
  plagiarism_score: number | null;
}

export default function ClassAnalyticsPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<GradingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "teacher" && role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [role, navigate]);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from("grading_results")
        .select("id, created_at, total_marks_awarded, final_total_marks, total_max_marks, plagiarism_score")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setRows((data ?? []) as GradingRow[]);
    } catch (err: any) {
      console.error("Failed to load analytics data", err);
      toast.error("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  const scoreBuckets = useMemo(() => {
    const buckets: Record<string, number> = {
      "0-49": 0,
      "50-69": 0,
      "70-84": 0,
      "85-100": 0,
    };

    rows.forEach((row) => {
      const base = row.final_total_marks ?? row.total_marks_awarded;
      const pct = Math.round((base / row.total_max_marks) * 100);
      if (pct < 50) buckets["0-49"]++;
      else if (pct < 70) buckets["50-69"]++;
      else if (pct < 85) buckets["70-84"]++;
      else buckets["85-100"]++;
    });

    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [rows]);

  const avgScore = useMemo(() => {
    if (!rows.length) return null;
    const sum = rows.reduce((acc, row) => {
      const base = row.final_total_marks ?? row.total_marks_awarded;
      return acc + (base / row.total_max_marks) * 100;
    }, 0);
    return Math.round(sum / rows.length);
  }, [rows]);

  const avgPlagiarism = useMemo(() => {
    const scores = rows.map((r) => r.plagiarism_score).filter((v): v is number => v != null);
    if (!scores.length) return null;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  }, [rows]);

  function exportCsv() {
    if (!rows.length) {
      toast.error("No data to export yet.");
      return;
    }

    const header = [
      "id",
      "created_at",
      "total_marks_awarded",
      "final_total_marks",
      "total_max_marks",
      "percentage",
      "plagiarism_score",
    ];

    const lines = rows.map((row) => {
      const base = row.final_total_marks ?? row.total_marks_awarded;
      const pct = Math.round((base / row.total_max_marks) * 100);
      return [
        row.id,
        row.created_at,
        row.total_marks_awarded,
        row.final_total_marks ?? "",
        row.total_max_marks,
        pct,
        row.plagiarism_score ?? "",
      ].join(",");
    });

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "intelligrade-class-analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Class Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Overview of scores and plagiarism indicators across recent evaluations.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={loading || !rows.length}>
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Evaluated Reports</CardTitle>
            <CardDescription>Grading results available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "–" : rows.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
            <CardDescription>Across evaluated submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "–" : avgScore != null ? `${avgScore}%` : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Plagiarism</CardTitle>
            <CardDescription>Indicator across graded reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "–" : avgPlagiarism != null ? `${avgPlagiarism}%` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>How many reports fall into each score band</CardDescription>
        </CardHeader>
        <CardContent style={{ height: 280 }}>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBuckets}>
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
