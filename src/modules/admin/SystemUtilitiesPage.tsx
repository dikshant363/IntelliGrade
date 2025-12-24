import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemUtilitiesPage() {
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
        <h1 className="text-3xl font-bold mb-2">System Utilities</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Judge-facing overview of the background engine that powers IntelliGrade AI: how files are
          parsed, text is processed, evaluations are run, scores are calculated, and results are
          generated.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Subpage 1 · File Processing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2 list-disc list-inside">
              <li>PDF Parser</li>
              <li>DOCX Parser</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 2 · Text Processing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2 list-disc list-inside">
              <li>Normalization</li>
              <li>Section Detection</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 3 · Evaluation Engine</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2 list-disc list-inside">
              <li>Structure Checker</li>
              <li>Keyword Matcher</li>
              <li>Concept Analyzer</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 4 · Scoring Engine</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2 list-disc list-inside">
              <li>Section-wise Scoring</li>
              <li>Total Score Aggregation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 5 · Result Generator</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2 list-disc list-inside">
              <li>UI Output</li>
              <li>PDF Export</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
