-- Phase 8: Teacher overrides and approval on grading_results (retry without IF NOT EXISTS)
ALTER TABLE public.grading_results
  ADD COLUMN final_section_grades jsonb,
  ADD COLUMN final_total_marks integer,
  ADD COLUMN final_overall_feedback text,
  ADD COLUMN is_final_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN final_approved_by uuid,
  ADD COLUMN final_approved_at timestamptz;

CREATE POLICY "Teachers can update grading results"
ON public.grading_results
FOR UPDATE
USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins can update grading results"
ON public.grading_results
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));