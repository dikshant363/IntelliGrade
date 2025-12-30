import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DetectedSection {
  label: string;
  startIndex: number;
  endIndex: number;
  preview: string;
}

// Very lightweight, deterministic text normalization
function normalizeText(input: string): string {
  if (!input.trim()) return "";

  let text = input.replace(/\r\n?/g, "\n");

  text = text
    .replace(/[\u2018\u2019\u0060]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "-");

  text = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  text = text.replace(/^(#+\s+)?([A-Z][A-Z\s]{3,})$/gm, (_match, _hashes, title) => {
    const lower = title.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });

  return text.trim();
}

// Simple heuristic section detector using common academic headings
function detectSections(text: string): DetectedSection[] {
  if (!text.trim()) return [];

  const patterns = [
    "introduction",
    "background",
    "literature review",
    "methodology",
    "methods",
    "results",
    "discussion",
    "analysis",
    "conclusion",
  ];

  const lower = text.toLowerCase();
  const matches: { label: string; index: number }[] = [];

  patterns.forEach((label) => {
    const idx = lower.indexOf(label);
    if (idx !== -1) {
      matches.push({ label, index: idx });
    }
  });

  if (matches.length === 0) {
    return [
      {
        label: "Body",
        startIndex: 0,
        endIndex: text.length,
        preview: text.slice(0, 240),
      },
    ];
  }

  matches.sort((a, b) => a.index - b.index);

  const sections: DetectedSection[] = [];
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const startIndex = current.index;
    const endIndex = next ? next.index : text.length;

    sections.push({
      label:
        current.label.charAt(0).toUpperCase() +
        current.label.slice(1),
      startIndex,
      endIndex,
      preview: text.slice(startIndex, Math.min(endIndex, startIndex + 260)),
    });
  }

  return sections;
}

export default function SystemUtilitiesTextProcessingPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [rawText, setRawText] = useState("");
  const [normalized, setNormalized] = useState("");
  const [sections, setSections] = useState<DetectedSection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  const runTextProcessingDemo = () => {
    if (!rawText.trim()) {
      setNormalized("");
      setSections([]);
      return;
    }

    setIsProcessing(true);

    const normalizedText = normalizeText(rawText);
    const detected = detectSections(normalizedText);

    setNormalized(normalizedText);
    setSections(detected);
    setIsProcessing(false);
  };

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

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Run Text Processing Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Paste raw extracted text</p>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste a few paragraphs from a report here, including headings like INTRODUCTION, METHODOLOGY, RESULTS..."
                className="min-h-[160px]"
              />
              <p className="text-xs text-muted-foreground">
                This runs a deterministic in-browser simulation of the same normalization and section
                detection logic the backend uses before AI grading.
              </p>
            </div>

            <Button onClick={runTextProcessingDemo} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Normalize & detect sections"}
            </Button>

            {normalized && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Normalized text</p>
                <div className="rounded-md border bg-card text-card-foreground max-h-64 overflow-auto p-3 text-xs whitespace-pre-wrap">
                  {normalized}
                </div>
              </div>
            )}

            {sections.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Detected sections</p>
                <div className="space-y-3 text-xs text-muted-foreground">
                  {sections.map((section, index) => (
                    <div
                      key={`${section.label}-${index}`}
                      className="rounded-md border bg-card text-card-foreground p-3 space-y-1"
                    >
                      <p className="text-sm font-semibold">{section.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Characters {section.startIndex}–{section.endIndex}
                      </p>
                      <p className="whitespace-pre-wrap">
                        {section.preview}
                        {section.endIndex - section.startIndex > section.preview.length ? "…" : ""}
                      </p>
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
