// Core evaluation engine shared types and helpers for IntelliGrade AI
// This layer is used by both backend grading functions and frontend components.

export type RubricSection = {
  section_name: string;
  description?: string;
  expectations?: string;
  max_marks: number;
};

export type SectionGrade = RubricSection & {
  marks_awarded: number;
  feedback?: string;
  similarity_score?: number;
};

export type GradingResultSummary = {
  total_marks_awarded: number;
  total_max_marks: number;
  final_total_marks?: number | null;
  plagiarism_score?: number | null;
  plagiarism_risk?: string | null;
};
