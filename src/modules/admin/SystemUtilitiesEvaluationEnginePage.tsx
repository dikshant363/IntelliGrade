import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface SectionEvaluation {
  name: string;
  present: boolean;
  lengthScore: number;
  keywordCoverage: number;
  conceptScore: number;
  notes: string[];
}

const DEMO_SECTIONS = ["Introduction", "Methodology", "Results", "Conclusion"];

const DEMO_KEYWORDS: Record<string, string[]> = {
  Introduction: ["background", "objective", "purpose"],
  Methodology: ["method", "procedure", "experimental", "dataset"],
  Results: ["result", "finding", "observation", "metric"],
  Conclusion: ["conclusion", "future work", "limitation", "summary"],
};

function simpleSectionSplit(text: string): Record<string, string> {
  const map: Record<string, string> = {};
  const lower = text.toLowerCase();

  DEMO_SECTIONS.forEach((section, index) => {
    const label = section.toLowerCase();
    const start = lower.indexOf(label);
    if (start === -1) return;
    const nextSection = DEMO_SECTIONS[index + 1]?.toLowerCase();
    const end = nextSection ? lower.indexOf(nextSection, start + label.length) : text.length;
    map[section] = text.slice(start, end === -1 ? text.length : end).trim();
  });

  if (Object.keys(map).length === 0 && text.trim()) {
    map.Body = text.trim();
  }

  return map;
}

function evaluateSection(name: string, content: string | undefined): SectionEvaluation {
  if (!content || !content.trim()) {
    return {
      name,
      present: false,
      lengthScore: 0,
      keywordCoverage: 0,
      conceptScore: 0,
      notes: ["Section heading not found or content is empty."],
    };
  }

  const notes: string[] = [];
  const length = content.length;
  let lengthScore = 0;
  if (length < 200) {
    lengthScore = 40;
    notes.push("Section is quite short – might be underdeveloped.");
  } else if (length < 600) {
    lengthScore = 80;
    notes.push("Section length looks reasonable.");
  } else {
    lengthScore = 95;
    notes.push("Section is detailed in length.");
  }

  const keywords = DEMO_KEYWORDS[name as keyof typeof DEMO_KEYWORDS] ?? [];
  const lower = content.toLowerCase();
  let matched = 0;
  keywords.forEach((kw) => {
    if (lower.includes(kw)) matched += 1;
  });
  const keywordCoverage = keywords.length
    ? Math.round((matched / keywords.length) * 100)
    : 70;
  if (keywords.length) {
    notes.push(`Matched ${matched} of ${keywords.length} rubric keywords.`);
  }

  let conceptScore = Math.round((lengthScore * 0.4 + keywordCoverage * 0.6));
  if (conceptScore > 100) conceptScore = 100;

  if (conceptScore > 85) {
    notes.push("Concept explanation appears strong for a demo heuristic.");
  } else if (conceptScore > 60) {
    notes.push("Concept coverage is decent but could be clearer or more complete.");
  } else {
    notes.push("Concept coverage seems weak – likely missing depth or clarity.");
  }

  return {
    name,
    present: true,
    lengthScore,
    keywordCoverage,
    conceptScore,
    notes,
  };
}

export default function SystemUtilitiesEvaluationEnginePage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [normalizedText, setNormalizedText] = useState("");
  const [evaluations, setEvaluations] = useState<SectionEvaluation[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  const runEvaluationDemo = () => {
    if (!normalizedText.trim()) {
      setEvaluations([]);
      return;
    }

    setIsRunning(true);

    const sections = simpleSectionSplit(normalizedText);

    const results = DEMO_SECTIONS.map((name) => evaluateSection(name, sections[name]));

    setEvaluations(results);
    setIsRunning(false);
  };

  const overallStructureScore =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce((sum, s) => sum + (s.present ? 100 : 40), 0) /
            evaluations.length,
        )
      : null;

  const overallKeywordScore =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce((sum, s) => sum + s.keywordCoverage, 0) /
            evaluations.length,
        )
      : null;

  const overallConceptScore =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce((sum, s) => sum + s.conceptScore, 0) / evaluations.length,
        )
      : null;

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
            <p>Verifies that all required sections are present and reasonably complete.</p>
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

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Run Evaluation Engine Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Paste normalized report text</p>
              <Textarea
                value={normalizedText}
                onChange={(e) => setNormalizedText(e.target.value)}
                placeholder="Paste text that already has headings like INTRODUCTION, METHODOLOGY, RESULTS, CONCLUSION..."
                className="min-h-[160px]"
              />
              <p className="text-xs text-muted-foreground">
                This deterministic demo simulates how IntelliGrade AI converts structure, keyword
                coverage, and conceptual clarity into per-section signals before scoring.
              </p>
            </div>

            <Button onClick={runEvaluationDemo} disabled={isRunning}>
              {isRunning ? "Running evaluation..." : "Evaluate against demo rubric"}
            </Button>

            {evaluations.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  {overallStructureScore !== null && (
                    <Badge variant="outline">Structure: {overallStructureScore}/100</Badge>
                  )}
                  {overallKeywordScore !== null && (
                    <Badge variant="outline">Keywords: {overallKeywordScore}/100</Badge>
                  )}
                  {overallConceptScore !== null && (
                    <Badge variant="outline">Concepts: {overallConceptScore}/100</Badge>
                  )}
                </div>

                <div className="space-y-3 text-xs text-muted-foreground">
                  {evaluations.map((section) => (
                    <div
                      key={section.name}
                      className="rounded-md border bg-card text-card-foreground p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{section.name}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={section.present ? "outline" : "destructive"}>
                            {section.present ? "Present" : "Missing"}
                          </Badge>
                          <Badge variant="outline">Length: {section.lengthScore}/100</Badge>
                          <Badge variant="outline">Keywords: {section.keywordCoverage}/100</Badge>
                          <Badge variant="outline">Concepts: {section.conceptScore}/100</Badge>
                        </div>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {section.notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
