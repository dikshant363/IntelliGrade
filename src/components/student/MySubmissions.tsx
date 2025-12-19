import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Clock, CheckCircle, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";

type Submission = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: string;
  created_at: string;
};

export default function MySubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  async function fetchSubmissions() {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast.error("Failed to load submissions: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadFile(filePath: string, fileName: string) {
    try {
      const { data, error } = await supabase.storage
        .from("reports")
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error: any) {
      toast.error("Download failed: " + error.message);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "grading":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Grading
          </Badge>
        );
      case "graded":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Graded
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = submission.file_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    const matchesStatus =
      statusFilter === "all" ? true : submission.status === statusFilter;

    const created = new Date(submission.created_at);
    const matchesFrom = dateFrom ? created >= new Date(dateFrom) : true;
    const matchesTo = dateTo ? created <= new Date(dateTo) : true;

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  if (filteredSubmissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Submissions</CardTitle>
          <CardDescription>View your uploaded reports and grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="search-submissions">
                  Search by file name
                </label>
                <Input
                  id="search-submissions"
                  placeholder="e.g. Midterm report.pdf"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="grading">Grading</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="date-from">
                    From
                  </label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="date-to">
                    To
                  </label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No submissions match your filters</p>
            <p className="text-sm">Try adjusting the search, status, or date range.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>My Submissions ({filteredSubmissions.length})</CardTitle>
            <CardDescription>Track your uploaded reports and grades</CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span>Filter by name, status, or date range</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="search-submissions-top"
              >
                Search by file name
              </label>
              <Input
                id="search-submissions-top"
                placeholder="e.g. Midterm report.pdf"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="grading">Grading</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 space-y-1">
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor="date-from-top"
                >
                  From
                </label>
                <Input
                  id="date-from-top"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor="date-to-top"
                >
                  To
                </label>
                <Input
                  id="date-to-top"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredSubmissions.map((submission) => (
            <Link
              key={submission.id}
              to={`/submission/${submission.id}`}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{submission.file_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{(submission.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(submission.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    downloadFile(submission.file_path, submission.file_name);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

