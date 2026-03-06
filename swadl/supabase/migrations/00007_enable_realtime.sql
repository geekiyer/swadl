-- Enable realtime for dashboard and chore manager tables
alter publication supabase_realtime add table public.feed_logs;
alter publication supabase_realtime add table public.diaper_logs;
alter publication supabase_realtime add table public.sleep_logs;
alter publication supabase_realtime add table public.caregiver_shifts;
alter publication supabase_realtime add table public.chores;
alter publication supabase_realtime add table public.chore_completions;
