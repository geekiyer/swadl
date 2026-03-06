-- Enable Row Level Security on all tables and create access policies.
--
-- Pattern: every query is filtered by household_id.
-- The policy checks that the requesting user's profile.household_id matches the row's household_id.
-- The "restricted" role gets SELECT and INSERT on logging tables but no access to
-- household settings or profile management.

-- Helper: get the current user's household_id
create or replace function public.get_my_household_id()
returns uuid as $$
  select household_id from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Helper: get the current user's role
create or replace function public.get_my_role()
returns public.profile_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- ============================================================
-- HOUSEHOLDS
-- ============================================================
alter table public.households enable row level security;

create policy "Members can view own household"
  on public.households for select
  using (id = public.get_my_household_id());

create policy "Admins can update own household"
  on public.households for update
  using (id = public.get_my_household_id() and public.get_my_role() = 'admin');

-- Allow insert during onboarding (user has no profile yet)
create policy "Authenticated users can create a household"
  on public.households for insert
  with check (auth.uid() is not null);

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

create policy "Members can view household profiles"
  on public.profiles for select
  using (household_id = public.get_my_household_id());

-- Users can insert their own profile (onboarding)
create policy "Users can create own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Admins can update any profile in their household (role changes)
create policy "Admins can update household profiles"
  on public.profiles for update
  using (
    household_id = public.get_my_household_id()
    and public.get_my_role() = 'admin'
  );

-- ============================================================
-- BABIES
-- ============================================================
alter table public.babies enable row level security;

create policy "Members can view household babies"
  on public.babies for select
  using (household_id = public.get_my_household_id());

create policy "Non-restricted members can insert babies"
  on public.babies for insert
  with check (
    household_id = public.get_my_household_id()
    and public.get_my_role() != 'restricted'
  );

create policy "Non-restricted members can update babies"
  on public.babies for update
  using (
    household_id = public.get_my_household_id()
    and public.get_my_role() != 'restricted'
  );

-- ============================================================
-- FEED LOGS
-- ============================================================
alter table public.feed_logs enable row level security;

-- All household members (including restricted) can view and insert
create policy "Members can view feed logs"
  on public.feed_logs for select
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );

create policy "Members can insert feed logs"
  on public.feed_logs for insert
  with check (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and logged_by = auth.uid()
  );

-- Only non-restricted can delete
create policy "Non-restricted members can delete feed logs"
  on public.feed_logs for delete
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and public.get_my_role() != 'restricted'
  );

-- ============================================================
-- DIAPER LOGS
-- ============================================================
alter table public.diaper_logs enable row level security;

create policy "Members can view diaper logs"
  on public.diaper_logs for select
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );

create policy "Members can insert diaper logs"
  on public.diaper_logs for insert
  with check (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and logged_by = auth.uid()
  );

create policy "Non-restricted members can delete diaper logs"
  on public.diaper_logs for delete
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and public.get_my_role() != 'restricted'
  );

-- ============================================================
-- SLEEP LOGS
-- ============================================================
alter table public.sleep_logs enable row level security;

create policy "Members can view sleep logs"
  on public.sleep_logs for select
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );

create policy "Members can insert sleep logs"
  on public.sleep_logs for insert
  with check (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and logged_by = auth.uid()
  );

create policy "Non-restricted members can delete sleep logs"
  on public.sleep_logs for delete
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and public.get_my_role() != 'restricted'
  );

-- ============================================================
-- CHORES
-- ============================================================
alter table public.chores enable row level security;

create policy "Members can view household chores"
  on public.chores for select
  using (household_id = public.get_my_household_id());

create policy "Non-restricted members can insert chores"
  on public.chores for insert
  with check (
    household_id = public.get_my_household_id()
    and public.get_my_role() != 'restricted'
  );

create policy "Non-restricted members can update chores"
  on public.chores for update
  using (
    household_id = public.get_my_household_id()
    and public.get_my_role() != 'restricted'
  );

create policy "Admins can delete chores"
  on public.chores for delete
  using (
    household_id = public.get_my_household_id()
    and public.get_my_role() = 'admin'
  );

-- ============================================================
-- CHORE COMPLETIONS
-- ============================================================
alter table public.chore_completions enable row level security;

create policy "Members can view chore completions"
  on public.chore_completions for select
  using (
    chore_id in (select id from public.chores where household_id = public.get_my_household_id())
  );

create policy "Members can insert chore completions"
  on public.chore_completions for insert
  with check (
    chore_id in (select id from public.chores where household_id = public.get_my_household_id())
    and completed_by = auth.uid()
  );

-- ============================================================
-- CAREGIVER SHIFTS
-- ============================================================
alter table public.caregiver_shifts enable row level security;

create policy "Members can view household shifts"
  on public.caregiver_shifts for select
  using (household_id = public.get_my_household_id());

create policy "Members can insert shifts"
  on public.caregiver_shifts for insert
  with check (
    household_id = public.get_my_household_id()
    and caregiver_id = auth.uid()
  );

create policy "Members can update own shifts"
  on public.caregiver_shifts for update
  using (
    household_id = public.get_my_household_id()
    and caregiver_id = auth.uid()
  );
