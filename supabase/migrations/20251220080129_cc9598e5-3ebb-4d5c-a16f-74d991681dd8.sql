-- Allow students to view active rubrics so the Select Rubric dropdown can show options
CREATE POLICY "Students can view active rubrics"
ON public.rubrics
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::app_role)
  AND is_active = true
);