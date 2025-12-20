import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorLogRow {
  id: string;
  created_at: string;
  level: string;
  source: string;
  message: string;
}

export default function ErrorLogsPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ErrorLogRow[]>([]);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadLogs();
  }, [role, navigate]);

  async function loadLogs() {
    const { data, error } = await supabase
      .from("error_logs")
      .select("id, created_at, level, source, message")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setRows(data as ErrorLogRow[]);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Logs</h1>
        <p className="text-muted-foreground text-sm">
          Recent application errors captured for debugging.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No errors have been logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2 pr-4">Time</th>
                    <th className="text-left py-2 pr-4">Level</th>
                    <th className="text-left py-2 pr-4">Source</th>
                    <th className="text-left py-2 pr-4">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 text-xs">{row.level}</td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">{row.source}</td>
                      <td className="py-2 pr-4 text-xs">{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
