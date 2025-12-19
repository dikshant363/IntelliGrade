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
};

type GradingResult = {
  id: string;
  section_grades: SectionGrade[];
  total_marks_awarded: number;
  total_max_marks: number;
  overall_feedback: string;
  ai_model: string;
  created_at: string;
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
        setResult({
          ...data,
          section_grades: data.section_grades as unknown as SectionGrade[],
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

  const percentage = Math.round((result.total_marks_awarded / result.total_max_marks) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Grading Results
              </CardTitle>
              <CardDescription>AI-generated evaluation with section-wise feedback</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {result.total_marks_awarded}/{result.total_max_marks}
              </div>
              <Badge variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "outline"}>
                {percentage}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={percentage} className="mb-4" />
          
          {result.overall_feedback && (
            <div className="p-4 bg-muted rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Overall Feedback</h4>
              <p className="text-sm text-muted-foreground">{result.overall_feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section-wise Breakdown</CardTitle>
          <CardDescription>Detailed marks and feedback for each section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.section_grades.map((section, index) => {
            const sectionPercentage = Math.round((section.marks_awarded / section.max_marks) * 100);
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{section.section_name}</h4>
                  <Badge variant="outline">
                    {section.marks_awarded}/{section.max_marks}
                  </Badge>
                </div>
                <Progress value={sectionPercentage} className="mb-3" />
                <p className="text-sm text-muted-foreground">{section.feedback}</p>
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
