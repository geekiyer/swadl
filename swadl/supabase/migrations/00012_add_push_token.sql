-- Add push_token column to profiles for Expo Push Notifications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token text;

-- Create a function that fires send-push when a chore is assigned
CREATE OR REPLACE FUNCTION public.notify_chore_assignment()
RETURNS trigger AS $$
DECLARE
  chore_title text;
  assigner_name text;
BEGIN
  -- Only fire when assigned_to changes to a non-null value
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    chore_title := NEW.title;

    -- Get the display name of the person who assigned (current user)
    SELECT display_name INTO assigner_name
    FROM public.profiles
    WHERE id = auth.uid();

    -- Call the send-push edge function via pg_net (if available)
    -- Otherwise this serves as a reference for setting up the DB webhook
    -- in the Supabase Dashboard under Database → Webhooks
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'user_id', NEW.assigned_to,
        'title', 'New task assigned',
        'body', COALESCE(assigner_name, 'Someone') || ' assigned you: ' || chore_title,
        'data', jsonb_build_object('chore_id', NEW.id)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to chores table
DROP TRIGGER IF EXISTS on_chore_assigned ON public.chores;
CREATE TRIGGER on_chore_assigned
  AFTER INSERT OR UPDATE OF assigned_to ON public.chores
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chore_assignment();
