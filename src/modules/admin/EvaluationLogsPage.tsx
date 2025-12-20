import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EvaluationLogRow {
  id: string;
  created_at: string;
  submission_id: string;
  total_marks_awarded: number;
  total_max_marks: number;
  final_total_marks: number | null;
  plagiarism_score: number | null;
}

export default function EvaluationLogsPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<EvaluationLogRow[]>([]);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadLogs();
  }, [role, navigate]);

  async function loadLogs() {
    const { data, error } = await supabase
      .from("grading_results")
      .select(
        "id, created_at, submission_id, total_marks_awarded, total_max_marks, final_total_marks, plagiarism_score"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setRows(data as EvaluationLogRow[]);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Evaluation Logs</h1>
        <p className="text-muted-foreground text-sm">
          Recent grading runs and plagiarism indicators (latest 50).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evaluations found yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2 pr-4">Time</th>
                    <th className="text-left py-2 pr-4">Submission ID</th>
                    <th className="text-left py-2 pr-4">Score</th>
                    <th className="text-left py-2 pr-4">Plagiarism</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const baseScore = row.final_total_marks ?? row.total_marks_awarded;
                    const scoreLabel = `${baseScore}/${row.total_max_marks}`;
                    return (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">{row.submission_id}</td>
                        <td className="py-2 pr-4">{scoreLabel}</td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground">
                          {row.plagiarism_score != null ? `${row.plagiarism_score}%` : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
