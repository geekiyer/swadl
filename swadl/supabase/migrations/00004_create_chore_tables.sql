-- Task & chore tables: chores, chore_completions

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  title text not null,
  description text,
  recurrence jsonb not null default '{}',
  assigned_to uuid references public.profiles on delete set null,
  category public.chore_category not null default 'other',
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chore_completions (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references public.chores on delete cascade,
  completed_by uuid not null references public.profiles on delete cascade,
  completed_at timestamptz not null default now()
);

-- Indexes
create index idx_chores_household_id on public.chores (household_id);
create index idx_chores_assigned_to on public.chores (assigned_to);
create index idx_chore_completions_chore_id on public.chore_completions (chore_id, completed_at desc);

-- Auto-update updated_at
create trigger set_updated_at_chores
  before update on public.chores
  for each row execute function public.handle_updated_at();
