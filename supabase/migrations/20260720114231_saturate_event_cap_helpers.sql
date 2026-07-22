-- event_photo_cap / event_guest_cap add extra_*_slots to the base limit. On the
-- `max` plan the base limit is already int4 max (2147483647), so any nonzero
-- extra slots would overflow int4 inside these SQL helpers. Sum in bigint and
-- clamp back to int4 max so caps saturate instead of raising "integer out of range".
CREATE OR REPLACE FUNCTION public.event_photo_cap(p_event_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select least(e.photo_limit::bigint + e.extra_photo_slots::bigint, 2147483647)::int
  from public.events e
  where e.id = p_event_id;
$function$;

CREATE OR REPLACE FUNCTION public.event_guest_cap(p_event_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select least(e.guest_limit::bigint + e.extra_guest_slots::bigint, 2147483647)::int
  from public.events e
  where e.id = p_event_id;
$function$;
