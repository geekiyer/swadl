-- Custom enum types used across tables

create type public.profile_role as enum ('admin', 'caregiver', 'restricted');

create type public.feeding_method as enum ('breast', 'bottle', 'combo', 'solids');

create type public.feed_type as enum ('breast_left', 'breast_right', 'bottle', 'solids');

create type public.diaper_type as enum ('wet', 'dirty', 'both', 'dry');

create type public.sleep_location as enum ('crib', 'bassinet', 'stroller', 'car', 'arms');

create type public.chore_category as enum (
  'feeding_prep', 'sanitation', 'laundry', 'diaper_bag', 'safety', 'other'
);
