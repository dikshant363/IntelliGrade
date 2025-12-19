-- Phase 7: Add plagiarism indicators to grading_results
ALTER TABLE public.grading_results
  ADD COLUMN IF NOT EXISTS plagiarism_score integer,
  ADD COLUMN IF NOT EXISTS plagiarism_risk text,
  ADD COLUMN IF NOT EXISTS plagiarism_explanation text;