-- Caregiver shift table

create table public.caregiver_shifts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  caregiver_id uuid not null references public.profiles on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  handoff_summary jsonb,
  created_at timestamptz not null default now()
);

-- Index for finding active shift (ended_at is null) per household
create index idx_shifts_household_active on public.caregiver_shifts (household_id, ended_at)
  where ended_at is null;
create index idx_shifts_household_started on public.caregiver_shifts (household_id, started_at desc);
