-- Pump type enum
create type public.pump_type as enum ('manual', 'electric_single', 'electric_double', 'haakaa');

-- Pump side enum
create type public.pump_side as enum ('left', 'right', 'both');

-- Pump logs table
create table public.pump_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  logged_by uuid not null references public.profiles(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  amount_oz numeric(5,1),
  pump_type public.pump_type not null,
  side public.pump_side not null default 'both',
  notes text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.pump_logs enable row level security;

create policy "Members can view pump logs"
  on public.pump_logs for select
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );

create policy "Members can insert pump logs"
  on public.pump_logs for insert
  with check (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and logged_by = auth.uid()
  );

create policy "Members can update own pump logs"
  on public.pump_logs for update
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and logged_by = auth.uid()
  );

create policy "Non-restricted members can delete pump logs"
  on public.pump_logs for delete
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
    and public.get_my_role() != 'restricted'
  );

-- Enable realtime
alter publication supabase_realtime add table public.pump_logs;
