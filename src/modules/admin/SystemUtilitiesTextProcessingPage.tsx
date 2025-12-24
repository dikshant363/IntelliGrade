import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemUtilitiesTextProcessingPage() {
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
        <h1 className="text-3xl font-bold mb-2">Text Processing</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          The cleaning and structuring step that prepares raw text for rubric-based evaluation.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Normalization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Fixes whitespace, encodings, and inconsistent headings so the same rubric works across
              many different report templates.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Remove extra spaces and line breaks</li>
              <li>Standardize quotes and bullet characters</li>
              <li>Normalize heading styles (e.g., "INTRODUCTION" → "Introduction")</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Detects logical sections like Introduction, Methodology, Results, and Conclusion so
              scores can be mapped to the right rubric sections.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Scan for common section titles and patterns</li>
              <li>Split the normalized text into labeled segments</li>
              <li>Store segment boundaries for downstream scoring</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
