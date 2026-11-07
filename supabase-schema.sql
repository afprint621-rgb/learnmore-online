-- LearnMore Academy parent and learner profile starter schema.
-- Run in Supabase SQL Editor. Enable email confirmation in Supabase Auth settings.
-- Do not add a service-role key to browser code or commit it to this repository.

create table if not exists public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  guardian_name text not null check (char_length(guardian_name) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parent_profiles(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 30),
  grade text not null check (grade in ('ECD', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7')),
  preferred_language text not null default 'English' check (preferred_language in ('English', 'Shona')),
  created_at timestamptz not null default now()
);

create index if not exists child_profiles_parent_id_idx on public.child_profiles(parent_id);

alter table public.parent_profiles enable row level security;
alter table public.child_profiles enable row level security;

-- A signed-in adult can only read and manage their own parent profile.
drop policy if exists "Parents read own profile" on public.parent_profiles;
create policy "Parents read own profile" on public.parent_profiles
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Parents create own profile" on public.parent_profiles;
create policy "Parents create own profile" on public.parent_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "Parents update own profile" on public.parent_profiles;
create policy "Parents update own profile" on public.parent_profiles
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Child profiles are accessible only to the authenticated adult who owns the parent profile.
drop policy if exists "Parents read own children" on public.child_profiles;
create policy "Parents read own children" on public.child_profiles
  for select to authenticated using (
    exists (select 1 from public.parent_profiles p where p.id = parent_id and p.user_id = (select auth.uid()))
  );

drop policy if exists "Parents add own children" on public.child_profiles;
create policy "Parents add own children" on public.child_profiles
  for insert to authenticated with check (
    exists (select 1 from public.parent_profiles p where p.id = parent_id and p.user_id = (select auth.uid()))
  );

drop policy if exists "Parents update own children" on public.child_profiles;
create policy "Parents update own children" on public.child_profiles
  for update to authenticated using (
    exists (select 1 from public.parent_profiles p where p.id = parent_id and p.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.parent_profiles p where p.id = parent_id and p.user_id = (select auth.uid()))
  );

drop policy if exists "Parents delete own children" on public.child_profiles;
create policy "Parents delete own children" on public.child_profiles
  for delete to authenticated using (
    exists (select 1 from public.parent_profiles p where p.id = parent_id and p.user_id = (select auth.uid()))
  );

-- Enforce the two-child maximum in the database, not just in the browser.
-- Locking the parent row serializes simultaneous profile inserts for the same account.
create or replace function public.enforce_two_child_profiles()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  current_count integer;
begin
  if tg_op = 'UPDATE' and new.parent_id = old.parent_id then
    return new;
  end if;

  perform 1 from public.parent_profiles where id = new.parent_id for update;
  if not found then
    raise exception 'Parent profile not found';
  end if;

  select count(*) into current_count
    from public.child_profiles where parent_id = new.parent_id;
  if current_count >= 2 then
    raise exception 'Each parent account can have a maximum of two child profiles';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_two_child_profiles() from public, anon, authenticated;
drop trigger if exists limit_two_child_profiles on public.child_profiles;
create trigger limit_two_child_profiles
  before insert or update of parent_id on public.child_profiles
  for each row execute function public.enforce_two_child_profiles();
