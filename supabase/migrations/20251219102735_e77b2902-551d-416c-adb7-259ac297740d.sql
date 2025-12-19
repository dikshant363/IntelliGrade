-- ====================================================
-- GRADING RESULTS TABLE
-- ====================================================
create table public.grading_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions(id) on delete cascade not null unique,
  rubric_id uuid references public.rubrics(id) on delete set null,
  section_grades jsonb not null, -- Array of {section_name, marks_awarded, max_marks, feedback}
  total_marks_awarded integer not null,
  total_max_marks integer not null,
  overall_feedback text,
  ai_model text not null default 'google/gemini-2.5-flash',
  processing_time_ms integer,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.grading_results enable row level security;

-- Students can view their own grading results
create policy "Students can view own grading results"
  on public.grading_results
  for select
  using (
    exists (
      select 1 from public.submissions
      where submissions.id = grading_results.submission_id
      and submissions.student_id = auth.uid()
    )
  );

-- Teachers can view all grading results
create policy "Teachers can view all grading results"
  on public.grading_results
  for select
  using (public.has_role(auth.uid(), 'teacher'));

-- Admins can view all grading results
create policy "Admins can view all grading results"
  on public.grading_results
  for select
  using (public.has_role(auth.uid(), 'admin'));

-- Only the grading edge function should insert results
-- (we'll handle this through service role key in the edge function)

-- Trigger to update updated_at
create or replace function public.update_grading_result_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_grading_results_timestamp
  before update on public.grading_results
  for each row execute procedure public.update_grading_result_updated_at();