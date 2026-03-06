-- Add UPDATE policies for logging tables.
-- Sleep logs need UPDATE to set ended_at when waking up.
-- Pump logs need UPDATE to set ended_at and amount when stopping.
-- Feed/diaper logs may need UPDATE for corrections.

-- SLEEP LOGS
create policy "Members can update sleep logs"
  on public.sleep_logs for update
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );

-- FEED LOGS
create policy "Members can update feed logs"
  on public.feed_logs for update
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );

-- DIAPER LOGS
create policy "Members can update diaper logs"
  on public.diaper_logs for update
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );

-- PUMP LOGS
create policy "Members can update pump logs"
  on public.pump_logs for update
  using (
    baby_id in (select id from public.babies where household_id = public.get_my_household_id())
  );
