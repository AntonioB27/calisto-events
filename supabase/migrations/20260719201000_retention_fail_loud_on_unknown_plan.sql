-- Guard against future retention drift. The previous bug happened because a plan
-- ('plus') existed in the event_plan enum but had no branch in the retention CASE,
-- so it silently fell through to the free-tier default (7 days) and cut off gallery
-- access months early.
--
-- events_compute_scheduled_deletion_at is the single source of truth: it runs in the
-- events_set_scheduled_deletion trigger, and event_retention_cutoff_at (used by the
-- storage read policy) delegates to it. Replace the silent `ELSE 7` default with a
-- hard error, so adding a new plan enum value without wiring up its retention window
-- fails loudly at event insert/update instead of silently under-retaining data.

CREATE OR REPLACE FUNCTION public.events_compute_scheduled_deletion_at(
  p_event_date timestamptz,
  p_plan event_plan
)
RETURNS timestamptz
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_days int;
BEGIN
  v_days := CASE p_plan
    WHEN 'free'     THEN 7
    WHEN 'standard' THEN 30
    WHEN 'plus'     THEN 90
    WHEN 'premium'  THEN 180
    WHEN 'max'      THEN 365
  END;

  IF v_days IS NULL THEN
    RAISE EXCEPTION
      'events_compute_scheduled_deletion_at: no retention window configured for plan %. Add a branch here (and keep lib/plan-limits.ts in sync).',
      p_plan;
  END IF;

  RETURN p_event_date + (v_days || ' days')::interval;
END;
$function$;
