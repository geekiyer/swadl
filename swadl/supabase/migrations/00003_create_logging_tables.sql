-- Logging tables: feed_logs, diaper_logs, sleep_logs

create table public.feed_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies on delete cascade,
  logged_by uuid not null references public.profiles on delete cascade,
  type public.feed_type not null,
  amount_oz numeric,
  duration_min int,
  started_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.diaper_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies on delete cascade,
  logged_by uuid not null references public.profiles on delete cascade,
  type public.diaper_type not null,
  logged_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies on delete cascade,
  logged_by uuid not null references public.profiles on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  location public.sleep_location not null,
  created_at timestamptz not null default now()
);

-- Indexes for common queries (latest logs per baby)
create index idx_feed_logs_baby_started on public.feed_logs (baby_id, started_at desc);
create index idx_diaper_logs_baby_logged on public.diaper_logs (baby_id, logged_at desc);
create index idx_sleep_logs_baby_started on public.sleep_logs (baby_id, started_at desc);
