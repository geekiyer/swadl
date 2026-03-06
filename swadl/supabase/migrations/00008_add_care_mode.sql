-- Add care_mode enum and column to households

create type public.care_mode as enum ('together', 'shifts', 'nanny');

alter table public.households
  add column care_mode public.care_mode not null default 'together';
