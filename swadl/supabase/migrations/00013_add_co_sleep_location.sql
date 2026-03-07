-- Add co_sleep to sleep_location enum
ALTER TYPE public.sleep_location ADD VALUE IF NOT EXISTS 'co_sleep' AFTER 'bassinet';
