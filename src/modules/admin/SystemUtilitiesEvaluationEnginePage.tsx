import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemUtilitiesEvaluationEnginePage() {
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
        <h1 className="text-3xl font-bold mb-2">Evaluation Engine</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          The core intelligence that compares the processed report to the rubric.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Structure Checker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Verifies that all required sections are present and reasonably complete.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check presence of rubric-required sections</li>
              <li>Flag missing or extremely short sections</li>
              <li>Send structure signals to the scoring engine</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keyword Matcher</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Looks for important domain-specific terms that indicate coverage of key topics.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Match rubric keywords inside each section</li>
              <li>Handle synonyms and basic variations</li>
              <li>Produce coverage scores per section</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Concept Analyzer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Goes beyond word matching to judge whether the underlying concepts are actually
              explained.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Compare student explanations to target concept descriptions</li>
              <li>Reward clarity, completeness, and correctness</li>
              <li>Feed semantic scores into final grading</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
