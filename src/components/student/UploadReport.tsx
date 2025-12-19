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

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

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

  useEffect(() => {
    fetchRubrics();
  }, []);

  async function fetchRubrics() {
    try {
      // Fetch active rubrics (students can see what's available)
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload PDF or DOCX files only.");
      return;
    }

    // Validate file size
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
      const { error: dbError } = await supabase.from("submissions").insert({
        student_id: user.id,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: "pending",
        rubric_id: selectedRubricId || null,
      });

      if (dbError) {
        // Cleanup: delete uploaded file if DB insert fails
        await supabase.storage.from("reports").remove([filePath]);
        throw dbError;
      }

      toast.success("Report uploaded successfully!");
      setFile(null);
      setSelectedRubricId("");
      
      // Trigger refresh of parent component if needed
      window.location.reload();
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
          Submit your academic report for AI-assisted grading (PDF or DOCX, max 20MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rubric-select">Select Rubric *</Label>
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
      </CardContent>
    </Card>
  );
}
