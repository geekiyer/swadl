-- Household invites: tracks pending invitations by email
create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email text not null,
  role public.profile_role not null default 'caregiver',
  invited_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(household_id, email)
);

-- RLS
alter table public.household_invites enable row level security;

-- Members of the household can view invites
create policy "Household members can view invites"
  on public.household_invites for select
  using (household_id = get_my_household_id());

-- Admins can insert invites
create policy "Admins can create invites"
  on public.household_invites for insert
  with check (
    household_id = get_my_household_id()
    and get_my_role() = 'admin'
  );

-- Admins can delete invites
create policy "Admins can delete invites"
  on public.household_invites for delete
  using (
    household_id = get_my_household_id()
    and get_my_role() = 'admin'
  );

-- Allow new users (no profile yet) to read invites for their email
-- This requires a permissive policy using auth.jwt()
create policy "Users can see their own invites by email"
  on public.household_invites for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));
