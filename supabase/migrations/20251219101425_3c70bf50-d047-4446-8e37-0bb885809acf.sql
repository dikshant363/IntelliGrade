-- ====================================================
-- PROFILES TABLE (minimal: auto-populated on signup)
-- ====================================================
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================
-- USER ROLES TABLE (separate from profiles for security)
-- ====================================================
create type public.app_role as enum ('admin', 'teacher', 'student');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check user role (bypasses RLS, prevents recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Users can view their own roles
create policy "Users can view own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

-- Only admins can insert/update/delete roles
create policy "Admins can manage roles"
  on public.user_roles
  for all
  using (public.has_role(auth.uid(), 'admin'));

-- For demo: Assign the FIRST user created as admin via trigger
create or replace function public.assign_first_user_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- If this is the first profile, assign admin
  if (select count(*) from public.profiles) = 1 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    -- Default to student for all subsequent signups
    insert into public.user_roles (user_id, role) values (new.id, 'student');
  end if;
  return new;
end;
$$;

create trigger assign_role_on_signup
  after insert on public.profiles
  for each row execute procedure public.assign_first_user_admin();