import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemUtilitiesFileProcessingPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

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
    </main>
  );
}
