import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, FileText } from "lucide-react";

type SectionGrade = {
  section_name: string;
  marks_awarded: number;
  max_marks: number;
  feedback: string;
  similarity_score?: number;
  similarity_explanation?: string;
  structure_compliance?: number;
  keyword_match?: number;
  concept_accuracy?: number;
  strengths?: string[];
  improvements?: string[];
};

type GradingResult = {
  id: string;
  section_grades: SectionGrade[];
  total_marks_awarded: number;
  total_max_marks: number;
  overall_feedback: string;
  ai_model: string;
  created_at: string;
  // Teacher override fields
  final_section_grades: SectionGrade[] | null;
  final_total_marks: number | null;
  final_overall_feedback: string | null;
  is_final_approved: boolean;
};

export default function GradingResults({ submissionId }: { submissionId: string }) {
  const [result, setResult] = useState<GradingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradingResult();
  }, [submissionId]);

  async function fetchGradingResult() {
    try {
      const { data, error } = await supabase
        .from("grading_results")
        .select("*")
        .eq("submission_id", submissionId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const baseSections = (data.section_grades as any[]).map((s) => ({
          section_name: s.section_name,
          marks_awarded: s.marks_awarded,
          max_marks: s.max_marks,
          feedback: s.feedback,
          similarity_score: s.similarity_score,
          similarity_explanation: s.similarity_explanation,
          structure_compliance: s.structure_compliance,
          keyword_match: s.keyword_match,
          concept_accuracy: s.concept_accuracy,
          strengths: s.strengths,
          improvements: s.improvements,
        }));

        const finalSectionsRaw = (data.final_section_grades as any[]) || null;
        const finalSections = finalSectionsRaw
          ? finalSectionsRaw.map((s) => ({
              section_name: s.section_name,
              marks_awarded: s.marks_awarded,
              max_marks: s.max_marks,
              feedback: s.feedback,
              similarity_score: s.similarity_score,
              similarity_explanation: s.similarity_explanation,
              structure_compliance: s.structure_compliance,
              keyword_match: s.keyword_match,
              concept_accuracy: s.concept_accuracy,
              strengths: s.strengths,
              improvements: s.improvements,
            }))
          : null;

        setResult({
          ...data,
          section_grades: baseSections,
          final_section_grades: finalSections,
          final_total_marks: data.final_total_marks ?? null,
          final_overall_feedback: data.final_overall_feedback ?? null,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch grading result:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading results...</div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No grading results available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isFinal = result.is_final_approved && result.final_total_marks != null && result.final_section_grades;
  const displayTotal = isFinal ? result.final_total_marks! : result.total_marks_awarded;
  const displaySections = isFinal ? result.final_section_grades! : result.section_grades;
  const displayOverallFeedback = isFinal && result.final_overall_feedback
    ? result.final_overall_feedback
    : result.overall_feedback;

  const percentage = Math.round((displayTotal / result.total_max_marks) * 100);

  const allStrengths = displaySections
    .flatMap((s) => s.strengths || [])
    .filter((s, idx, arr) => s && arr.indexOf(s) === idx);
  const allImprovements = displaySections
    .flatMap((s) => s.improvements || [])
    .filter((s, idx, arr) => s && arr.indexOf(s) === idx);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {isFinal ? "Final Grade" : "AI Grading Results"}
              </CardTitle>
              <CardDescription>
                {isFinal
                  ? "Teacher-approved final grade based on AI evaluation"
                  : "AI-generated evaluation with section-wise feedback"}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {displayTotal}/{result.total_max_marks}
              </div>
              <Badge variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "outline"}>
                {percentage}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={percentage} className="mb-4" />

          {isFinal && (
            <p className="text-xs text-muted-foreground mb-2">
              Based on AI suggestion of {result.total_marks_awarded}/{result.total_max_marks},
              with teacher review and possible adjustments.
            </p>
          )}
          
          {(allStrengths.length > 0 || allImprovements.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              {allStrengths.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Strengths</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {allStrengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {allImprovements.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Areas for improvement</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {allImprovements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {displayOverallFeedback && (
            <div className="p-4 bg-muted rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Overall Feedback</h4>
              <p className="text-sm text-muted-foreground">{displayOverallFeedback}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section-wise Breakdown</CardTitle>
          <CardDescription>
            Detailed marks, structure, keywords, concepts, and feedback for each section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displaySections.map((section, index) => {
            const sectionPercentage = Math.round((section.marks_awarded / section.max_marks) * 100);
            const similarity = section.similarity_score ?? null;
            const structure = section.structure_compliance ?? null;
            const keywordMatch = section.keyword_match ?? null;
            const conceptAccuracy = section.concept_accuracy ?? null;

            const similarityLabel =
              similarity === null
                ? null
                : similarity >= 80
                  ? "High match"
                  : similarity >= 60
                    ? "Good match"
                    : similarity >= 40
                      ? "Partial match"
                      : "Low match";

            return (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between mb-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{section.section_name}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {structure !== null && (
                        <Badge variant="outline">
                          Structure compliance: {structure}%
                        </Badge>
                      )}
                      {keywordMatch !== null && (
                        <Badge variant="outline">
                          Keyword match: {keywordMatch}%
                        </Badge>
                      )}
                      {conceptAccuracy !== null && (
                        <Badge variant="outline">
                          Concept accuracy: {conceptAccuracy}%
                        </Badge>
                      )}
                      {similarity !== null && (
                        <Badge variant={similarity >= 80 ? "default" : similarity >= 60 ? "secondary" : "outline"}>
                          Rubric match: {similarityLabel} ({similarity}%)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {section.marks_awarded}/{section.max_marks}
                  </Badge>
                </div>
                <Progress value={sectionPercentage} className="mb-2" />
                <p className="text-sm text-muted-foreground mb-1">{section.feedback}</p>
                {section.similarity_explanation && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Why this match score:</span> {section.similarity_explanation}
                  </p>
                )}
                {(section.strengths?.length || 0) > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold mb-1">Section strengths</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {section.strengths!.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(section.improvements?.length || 0) > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold mb-1">Ways to improve this section</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {section.improvements!.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Graded on {new Date(result.created_at).toLocaleString()} using {result.ai_model}
      </div>
    </div>
  );
}
