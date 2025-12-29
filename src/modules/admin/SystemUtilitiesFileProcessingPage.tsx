import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SystemUtilitiesFileProcessingPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState<string>("");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setExtractedText("");
      setProcessingSteps([]);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF or DOCX report.",
        variant: "destructive",
      });
      setSelectedFile(null);
      setExtractedText("");
      setProcessingSteps([]);
      return;
    }

    setSelectedFile(file);
    setExtractedText("");
    setProcessingSteps([]);
  };

  const runFileProcessingDemo = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Choose a PDF or DOCX report to run the pipeline.",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingSteps([]);
    setExtractedText("");

    const isPdf = selectedFile.type === "application/pdf";

    const pdfSteps = [
      "Open PDF and scan pages",
      "Detect text blocks and headings",
      "Merge into a continuous, structured document",
    ];

    const docxSteps = [
      "Read paragraphs and headings",
      "Strip layout-only formatting",
      "Output clean text with section markers",
    ];

    const stepsToRun = isPdf ? pdfSteps : docxSteps;

    const runStepsSequentially = async () => {
      for (const step of stepsToRun) {
        setProcessingSteps((prev) => [...prev, step]);
        // Small delay so admins can see the pipeline progressing
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    };

    try {
      await runStepsSequentially();

      const reader = new FileReader();

      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const preview = text.slice(0, 4000);
        setExtractedText(preview || "No readable text content detected in this file preview.");
        setIsProcessing(false);
      };

      reader.onerror = () => {
        console.error("Failed to read file for demo parsing");
        toast({
          title: "Parsing demo failed",
          description: "We could not read this file in the browser. Try another sample.",
          variant: "destructive",
        });
        setIsProcessing(false);
      };

      reader.readAsText(selectedFile);
    } catch (error) {
      console.error("File processing demo error", error);
      toast({
        title: "File processing demo error",
        description: "An unexpected error occurred while running the pipeline.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">File Processing</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          How IntelliGrade AI converts uploaded student reports into clean, machine-readable text.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>PDF Parser</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Extracts text, headings, and basic structure from PDF files so the evaluation engine can
              work with them.
            </p>
            <p className="font-medium">Pipeline snapshot</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Open PDF and scan pages</li>
              <li>Detect text blocks and headings</li>
              <li>Merge into a continuous, structured document</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DOCX Parser</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Reads Word documents and normalizes the styles so the rest of the system sees a
              consistent representation.
            </p>
            <p className="font-medium">Pipeline snapshot</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Read paragraphs and headings</li>
              <li>Strip layout-only formatting</li>
              <li>Output clean text with section markers</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Run File Processing Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-demo">Upload a sample PDF or DOCX report</Label>
              <Input
                id="file-demo"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                This admin-only demo runs the same logical pipeline steps the backend uses, entirely in
                your browser. It does not store the file.
              </p>
            </div>

            <Button onClick={runFileProcessingDemo} disabled={isProcessing || !selectedFile}>
              {isProcessing ? "Running pipeline..." : "Run pipeline"}
            </Button>

            {processingSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Pipeline progress</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  {processingSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {extractedText && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Extracted text preview</p>
                <div className="rounded-md border bg-card text-card-foreground max-h-64 overflow-auto p-3 text-xs whitespace-pre-wrap">
                  {extractedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
