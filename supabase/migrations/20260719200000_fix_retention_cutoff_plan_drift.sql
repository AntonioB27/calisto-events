-- Fix: event_retention_cutoff_at had a stale CASE that never got a 'plus' branch,
-- so 'plus' events (and mismatched standard/premium/max windows) fell through to the
-- free-tier 7 days. The storage read policy (event_media_read) uses this function to
-- gate signed-URL generation, so guests lost gallery access months before the data is
-- actually deleted. Delegate to events_compute_scheduled_deletion_at, the same source of
-- truth the deletion job and lib/plan-limits.ts use, so retention and read access agree.

CREATE OR REPLACE FUNCTION public.event_retention_cutoff_at(p_event_id uuid)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.events_compute_scheduled_deletion_at(e.event_date, e.plan)
  FROM public.events e
  WHERE e.id = p_event_id;
$function$;
