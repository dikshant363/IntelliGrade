import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemUtilitiesScoringEnginePage() {
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
        <h1 className="text-3xl font-bold mb-2">Scoring Engine</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Translates evaluation signals into rubric-aligned marks that teachers can review.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Section-wise Scoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Combines structure, keyword, and concept signals into a mark for each rubric section.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Apply teacher-defined maximum marks</li>
              <li>Weight different signals per rubric settings</li>
              <li>Produce an interpretable score per section</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Score Aggregation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Adds up all section scores into a single total while keeping a clear audit trail.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sum section scores and cap at total rubric marks</li>
              <li>Store breakdown for transparency and overrides</li>
              <li>Send final score to the result generator</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
