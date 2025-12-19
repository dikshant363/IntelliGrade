-- ====================================================
-- RUBRICS TABLE
-- ====================================================
create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  subject text not null,
  sections jsonb not null, -- Array of {name, description, max_marks}
  total_marks integer not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.rubrics enable row level security;

-- Teachers can view all rubrics
create policy "Teachers can view all rubrics"
  on public.rubrics
  for select
  using (public.has_role(auth.uid(), 'teacher'));

-- Teachers can create rubrics
create policy "Teachers can create rubrics"
  on public.rubrics
  for insert
  with check (
    public.has_role(auth.uid(), 'teacher') 
    and auth.uid() = teacher_id
  );

-- Teachers can update their own rubrics
create policy "Teachers can update own rubrics"
  on public.rubrics
  for update
  using (
    public.has_role(auth.uid(), 'teacher') 
    and auth.uid() = teacher_id
  );

-- Teachers can delete their own rubrics
create policy "Teachers can delete own rubrics"
  on public.rubrics
  for delete
  using (
    public.has_role(auth.uid(), 'teacher') 
    and auth.uid() = teacher_id
  );

-- Admins can view all rubrics
create policy "Admins can view all rubrics"
  on public.rubrics
  for select
  using (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
create or replace function public.update_rubric_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_rubrics_timestamp
  before update on public.rubrics
  for each row execute procedure public.update_rubric_updated_at();

-- ====================================================
-- UPDATE SUBMISSIONS TABLE to link rubrics
-- ====================================================
alter table public.submissions
  add constraint fk_rubric
  foreign key (rubric_id) references public.rubrics(id) on delete set null;