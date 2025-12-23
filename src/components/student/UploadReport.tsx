import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const DEFAULT_ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"] as const;
const MIME_BY_EXTENSION: Record<string, string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  doc: ["application/msword"],
};

type Rubric = {
  id: string;
  title: string;
  subject: string;
  is_active: boolean;
};

export default function UploadReport() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([...DEFAULT_ALLOWED_EXTENSIONS]);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    fetchRubrics();
    fetchAllowedFormats();
  }, []);

  async function fetchRubrics() {
    try {
      const { data } = await supabase
        .from("rubrics")
        .select("id, title, subject, is_active")
        .eq("is_active", true)
        .order("title");

      setRubrics(data || []);
    } catch (error) {
      console.error("Failed to fetch rubrics:", error);
    }
  }

  async function fetchAllowedFormats() {
    try {
      const { data, error } = await supabase
        .from("evaluation_settings")
        .select("value")
        .eq("key", "allowed_file_formats")
        .maybeSingle();

      if (error) {
        console.error("Failed to load allowed formats", error);
        return;
      }

      const value = data?.value as string[] | undefined;
      if (Array.isArray(value) && value.length > 0) {
        const normalized = value
          .map((v) => v.toLowerCase().trim())
          .filter((v) => DEFAULT_ALLOWED_EXTENSIONS.includes(v as any));
        if (normalized.length > 0) {
          setAllowedExtensions(normalized);
        }
      }
    } catch (err) {
      console.error("Error loading allowed formats", err);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      toast.error(
        `Invalid file type. Allowed formats: ${allowedExtensions
          .map((e) => e.toUpperCase())
          .join(", ")}.`,
      );
      return;
    }

    const allowedMimes = allowedExtensions.flatMap((e) => MIME_BY_EXTENSION[e] || []);

    if (!allowedMimes.includes(selectedFile.type)) {
      toast.error("File type does not match allowed formats. Please upload a valid PDF/DOCX file.");
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      toast.error("File too large. Maximum size is 20MB.");
      return;
    }

    setFile(selectedFile);
    toast.success("File selected: " + selectedFile.name);
  }

  async function handleUpload() {
    if (!file || !user) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);

    try {
      // Generate unique file path with user folder
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save metadata to submissions table
      const { data, error: dbError } = await supabase
        .from("submissions")
        .insert({
          student_id: user.id,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: "pending",
          rubric_id: selectedRubricId || null,
        })
        .select("id")
        .single();

      if (dbError) {
        // Cleanup: delete uploaded file if DB insert fails
        await supabase.storage.from("reports").remove([filePath]);
        throw dbError;
      }

      toast.success("Report uploaded successfully!");
      setFile(null);
      setSelectedRubricId("");
      setLastSubmissionId(data?.id ?? null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Report
        </CardTitle>
          <CardDescription>
            Submit your academic report for AI-assisted grading (allowed formats: {allowedExtensions
              .map((e) => e.toUpperCase())
              .join(", ")}, max 20MB)
          </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rubric-select">Select Rubric *</Label>
          <p className="text-xs text-muted-foreground">
            This controls which criteria the AI uses to grade your report.
          </p>
          <Select value={selectedRubricId} onValueChange={setSelectedRubricId} disabled={uploading}>
            <SelectTrigger>
              <SelectValue placeholder="Choose grading rubric" />
            </SelectTrigger>
            <SelectContent>
              {rubrics.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No active rubrics available</div>
              ) : (
                rubrics.map((rubric) => (
                  <SelectItem key={rubric.id} value={rubric.id}>
                    {rubric.title} ({rubric.subject})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">{file.name}</p>
                <p className="text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || !selectedRubricId || uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload Report"}
        </Button>

        {lastSubmissionId && (
          <div className="mt-4 p-3 rounded-lg bg-muted text-sm flex flex-col gap-2">
            <p className="font-medium">Submission received.</p>
            <p className="text-muted-foreground">
              Your report is now in the queue for AI grading. You can track its status or view detailed
              results once grading is complete.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/student/submission/${lastSubmissionId}`}
                className="text-primary underline underline-offset-2"
              >
                View this submission
              </a>
              <a
                href="/student/my-submissions"
                className="text-primary underline underline-offset-2"
              >
                Go to My Submissions
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
