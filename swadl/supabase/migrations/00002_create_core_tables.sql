-- Core tables: households, profiles, babies

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  household_id uuid not null references public.households on delete cascade,
  display_name text not null,
  role public.profile_role not null default 'caregiver',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.babies (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  name text not null,
  date_of_birth date not null,
  feeding_method public.feeding_method not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for foreign key lookups
create index idx_profiles_household_id on public.profiles (household_id);
create index idx_babies_household_id on public.babies (household_id);

-- Auto-update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_households
  before update on public.households
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_babies
  before update on public.babies
  for each row execute function public.handle_updated_at();
