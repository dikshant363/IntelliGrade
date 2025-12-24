import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemUtilitiesPage() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">System Utilities</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Judge-facing overview of the technical plumbing behind IntelliGrade AI — how files are
          parsed, text is normalized, evaluations are computed, scores are aggregated, and results
          are generated.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Subpage 1: File Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Subpage 1 · File Processing</CardTitle>
            <CardDescription>How raw student reports become machine-readable text.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <span className="font-medium">PDF Parser</span>
              <p>
                Handles uploaded PDF reports, extracts clean text while ignoring layout noise so the
                evaluation engine can work reliably.
              </p>
            </div>
            <div>
              <span className="font-medium">DOCX Parser</span>
              <p>
                Reads Word documents, preserves headings and sections, and forwards structured
                content into the text-processing pipeline.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subpage 2: Text Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Subpage 2 · Text Processing</CardTitle>
            <CardDescription>Preparing text so rubric-based grading is consistent.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <span className="font-medium">Normalization</span>
              <p>
                Cleans whitespace, casing, and formatting artifacts so equivalent answers look the
                same to the evaluation engine.
              </p>
            </div>
            <div>
              <span className="font-medium">Section Detection</span>
              <p>
                Splits reports into logical parts (Introduction, Methodology, Results, etc.) to
                align exactly with rubric sections.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subpage 3: Evaluation Engine */}
        <Card>
          <CardHeader>
            <CardTitle>Subpage 3 · Evaluation Engine</CardTitle>
            <CardDescription>Core intelligence that compares content to the rubric.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <span className="font-medium">Structure Checker</span>
              <p>
                Verifies that required sections are present and ordered correctly, matching academic
                writing expectations.
              </p>
            </div>
            <div>
              <span className="font-medium">Keyword Matcher</span>
              <p>
                Looks for rubric-defined keywords and phrases to ensure coverage of key ideas and
                terminology.
              </p>
            </div>
            <div>
              <span className="font-medium">Concept Analyzer</span>
              <p>
                Goes beyond keywords to assess whether concepts are correctly explained and applied
                in context.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subpage 4: Scoring Engine */}
        <Card>
          <CardHeader>
            <CardTitle>Subpage 4 · Scoring Engine</CardTitle>
            <CardDescription>Transforms rubric checks into actual marks.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <span className="font-medium">Section-wise Scoring</span>
              <p>
                Assigns marks per rubric section so teachers and students can see exactly where
                points were gained or lost.
              </p>
            </div>
            <div>
              <span className="font-medium">Total Score Aggregation</span>
              <p>
                Aggregates section scores into a transparent overall mark, always respecting the
                rubric&apos;s maximum marks.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subpage 5: Result Generator */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subpage 5 · Result Generator</CardTitle>
            <CardDescription>
              How IntelliGrade AI turns scores into human-readable outputs for students and
              teachers.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>
              <span className="font-medium">UI Output</span>
              <p>
                Feeds final marks, section breakdowns, and feedback into the Student and Teacher
                panels, keeping the interface synchronized with the backend.
              </p>
            </div>
            <div>
              <span className="font-medium">PDF Export</span>
              <p>
                Powers the downloadable evaluation report so results can be shared or archived in a
                formal, academic format.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
