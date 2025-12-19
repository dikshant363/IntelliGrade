-- ====================================================
-- STORAGE BUCKET FOR REPORT UPLOADS
-- ====================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reports',
  'reports',
  false,
  20971520, -- 20MB limit
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
);

-- RLS for reports bucket: Students can upload their own files
create policy "Students can upload own reports"
  on storage.objects
  for insert
  with check (
    bucket_id = 'reports' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Students can view their own reports
create policy "Students can view own reports"
  on storage.objects
  for select
  using (
    bucket_id = 'reports' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Students can delete their own reports
create policy "Students can delete own reports"
  on storage.objects
  for delete
  using (
    bucket_id = 'reports' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Teachers can view all reports
create policy "Teachers can view all reports"
  on storage.objects
  for select
  using (
    bucket_id = 'reports' 
    and public.has_role(auth.uid(), 'teacher')
  );

-- Admins can view all reports
create policy "Admins can view all reports"
  on storage.objects
  for select
  using (
    bucket_id = 'reports' 
    and public.has_role(auth.uid(), 'admin')
  );

-- ====================================================
-- SUBMISSIONS TABLE (stores metadata for uploads)
-- ====================================================
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  file_path text not null,
  file_name text not null,
  file_size integer not null,
  mime_type text not null,
  status text not null default 'pending' check (status in ('pending', 'grading', 'graded', 'approved')),
  rubric_id uuid, -- will reference rubrics table in Phase 4
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.submissions enable row level security;

-- Students can view their own submissions
create policy "Students can view own submissions"
  on public.submissions
  for select
  using (auth.uid() = student_id);

-- Students can create their own submissions
create policy "Students can create own submissions"
  on public.submissions
  for insert
  with check (auth.uid() = student_id);

-- Teachers can view all submissions
create policy "Teachers can view all submissions"
  on public.submissions
  for select
  using (public.has_role(auth.uid(), 'teacher'));

-- Teachers can update submissions (for grading)
create policy "Teachers can update submissions"
  on public.submissions
  for update
  using (public.has_role(auth.uid(), 'teacher'));

-- Admins can view all submissions
create policy "Admins can view all submissions"
  on public.submissions
  for select
  using (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at timestamp
create or replace function public.update_submission_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_submissions_timestamp
  before update on public.submissions
  for each row execute procedure public.update_submission_updated_at();