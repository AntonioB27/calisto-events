-- Plan-based automatic event deletion: scheduled_deletion_at = event_date + retention days.
-- Retention: free 7d, standard 30d, plus 90d, premium 180d, max 365d.
-- Depends on migration 20260511190001_event_plan_add_plus.sql for enum value `plus`.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS scheduled_deletion_at timestamptz;

CREATE OR REPLACE FUNCTION public.events_compute_scheduled_deletion_at(
  p_event_date timestamptz,
  p_plan public.event_plan
)
RETURNS timestamptz
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT p_event_date + (
    CASE p_plan
      WHEN 'free' THEN 7
      WHEN 'standard' THEN 30
      WHEN 'plus' THEN 90
      WHEN 'premium' THEN 180
      WHEN 'max' THEN 365
      ELSE 7
    END || ' days'
  )::interval;
$$;

UPDATE public.events e
SET scheduled_deletion_at = public.events_compute_scheduled_deletion_at(e.event_date, e.plan)
WHERE e.scheduled_deletion_at IS NULL;

ALTER TABLE public.events
  ALTER COLUMN scheduled_deletion_at SET NOT NULL;

CREATE OR REPLACE FUNCTION public.events_set_scheduled_deletion_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.scheduled_deletion_at := public.events_compute_scheduled_deletion_at(NEW.event_date, NEW.plan);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_set_scheduled_deletion ON public.events;
CREATE TRIGGER events_set_scheduled_deletion
  BEFORE INSERT OR UPDATE OF event_date, plan ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.events_set_scheduled_deletion_trigger_fn();

CREATE INDEX IF NOT EXISTS events_scheduled_deletion_at_idx
  ON public.events (scheduled_deletion_at);

CREATE OR REPLACE FUNCTION public.delete_event_system_return_paths(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  path_list jsonb;
BEGIN
  SELECT coalesce(jsonb_agg(m.storage_path) FILTER (WHERE m.storage_path IS NOT NULL AND m.storage_path <> ''), '[]'::jsonb)
  INTO path_list
  FROM public.media_items m
  WHERE m.event_id = p_event_id;

  DELETE FROM public.media_items WHERE event_id = p_event_id;
  DELETE FROM public.event_memberships WHERE event_id = p_event_id;
  DELETE FROM public.events WHERE id = p_event_id;

  RETURN path_list;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_event_system_return_paths(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_event_system_return_paths(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.events_apply_plan_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  case new.plan
    when 'free' then
      new.photo_limit := 20;
      new.video_limit := 0;
      new.guest_limit := 5;
    when 'standard' then
      new.photo_limit := 150;
      new.video_limit := 10;
      new.guest_limit := 30;
    when 'plus' then
      new.photo_limit := 500;
      new.video_limit := 50;
      new.guest_limit := 100;
    when 'premium' then
      new.photo_limit := 2000;
      new.video_limit := 200;
      new.guest_limit := 250;
    when 'max' then
      new.photo_limit := 2147483647;
      new.video_limit := 2147483647;
      new.guest_limit := 2147483647;
    else
      new.photo_limit := 20;
      new.video_limit := 0;
      new.guest_limit := 5;
  end case;
  new.extra_photo_slots := coalesce(new.extra_photo_slots, 0);
  new.extra_guest_slots := coalesce(new.extra_guest_slots, 0);
  return new;
end;
$function$;
