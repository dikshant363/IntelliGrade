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
            <CardDescription>
              How raw student reports are turned into machine-readable text.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <p className="font-medium">PDF Parser</p>
              <p>
                Extracts structured text, headings, and sections from uploaded PDF reports while
                preserving academic formatting as much as possible.
              </p>
            </div>
            <div>
              <p className="font-medium">DOCX Parser</p>
              <p>
                Reads Word documents, normalizes styles, and converts them into a unified text
                representation for downstream analysis.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 2 · Text Processing</CardTitle>
            <CardDescription>
              Prepares extracted text so it aligns cleanly with rubric expectations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <p className="font-medium">Normalization</p>
              <p>
                Cleans whitespace, fixes encoding issues, and standardizes headings so that AI
                comparisons are robust and consistent.
              </p>
            </div>
            <div>
              <p className="font-medium">Section Detection</p>
              <p>
                Identifies logical sections such as Introduction, Methodology, Results, and
                Conclusion to map content directly to rubric sections.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 3 · Evaluation Engine</CardTitle>
            <CardDescription>
              Core intelligence that compares student work with rubric criteria.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <p className="font-medium">Structure Checker</p>
              <p>
                Verifies that required sections are present, ordered correctly, and reasonably
                complete according to the rubric.
              </p>
            </div>
            <div>
              <p className="font-medium">Keyword Matcher</p>
              <p>
                Detects essential terminology and domain-specific phrases that should appear in a
                strong submission.
              </p>
            </div>
            <div>
              <p className="font-medium">Concept Analyzer</p>
              <p>
                Goes beyond keywords to judge whether key concepts are actually understood and
                explained, not just mentioned.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 4 · Scoring Engine</CardTitle>
            <CardDescription>
              Turns evaluation signals into rubric-aligned marks.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <p className="font-medium">Section-wise Scoring</p>
              <p>
                Assigns scores per rubric section, using the teacher-defined maximum marks and
                intensity of matches from the evaluation engine.
              </p>
            </div>
            <div>
              <p className="font-medium">Total Score Aggregation</p>
              <p>
                Combines all section scores into a single total while keeping a full audit trail for
                teachers to review and override.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subpage 5 · Result Generator</CardTitle>
            <CardDescription>
              How IntelliGrade AI presents grades and feedback back to humans.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <p className="font-medium">UI Output</p>
              <p>
                Feeds scores, section breakdowns, and explanations into the Student, Teacher, and
                Admin panels for transparent review.
              </p>
            </div>
            <div>
              <p className="font-medium">PDF Export</p>
              <p>
                Generates clean, printable PDF reports that include marks, feedback, and plagiarism
                indicators for official use.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
