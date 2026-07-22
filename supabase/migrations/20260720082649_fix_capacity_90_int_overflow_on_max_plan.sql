-- The capacity-90 threshold check multiplied int4 caps by 9/10. For the `max`
-- plan the caps are int4 max (2147483647), so `v_cap * 9` overflowed int4 and
-- raised "integer out of range", crashing every max-plan event insert (the
-- function fires via handle_new_event when the organizer membership is created).
-- Cast the comparison operands to bigint so the arithmetic can't overflow.
CREATE OR REPLACE FUNCTION public.enqueue_capacity_90_notifications(p_event_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_event_exists boolean := false;
  v_photo_used int := 0;
  v_video_used int := 0;
  v_guest_used int := 0;
  v_photo_cap int := 0;
  v_video_cap int := 0;
  v_guest_cap int := 0;
  v_type public.notification_type;
  v_used int;
  v_cap int;
  v_metric text;
  v_rec record;
  v_count int := 0;
  v_dedupe_time timestamptz := '2000-01-01 00:00:00+00'::timestamptz;
begin
  select exists(select 1 from public.events e where e.id = p_event_id) into v_event_exists;
  if not v_event_exists then
    return 0;
  end if;

  select count(*)::int into v_photo_used
  from public.media_items m
  where m.event_id = p_event_id
    and coalesce(m.mime_type, '') like 'image/%';

  select count(*)::int into v_video_used
  from public.media_items m
  where m.event_id = p_event_id
    and coalesce(m.mime_type, '') like 'video/%';

  -- Keep guest capacity in sync with app-side metric display: all event members.
  select count(*)::int into v_guest_used
  from public.event_memberships em
  where em.event_id = p_event_id;

  v_photo_cap := coalesce(public.event_photo_cap(p_event_id), 0);
  v_video_cap := coalesce(public.event_video_cap(p_event_id), 0);
  v_guest_cap := coalesce(public.event_guest_cap(p_event_id), 0);

  for v_type, v_used, v_cap, v_metric in
    select *
    from (
      values
        ('photos_capacity_90'::public.notification_type, v_photo_used, v_photo_cap, 'photos'),
        ('videos_capacity_90'::public.notification_type, v_video_used, v_video_cap, 'videos'),
        ('guests_capacity_90'::public.notification_type, v_guest_used, v_guest_cap, 'guests')
    ) as t(type, used_count, cap_count, metric)
  loop
    if v_cap <= 0 then
      continue;
    end if;
    -- Cast to bigint: for the `max` plan v_cap is int4 max and `v_cap * 9` would overflow int4.
    if v_used::bigint * 10 < v_cap::bigint * 9 then
      continue;
    end if;

    for v_rec in
      select user_id
      from (
        select e.organizer_id as user_id
        from public.events e
        where e.id = p_event_id
        union
        select m.user_id
        from public.event_memberships m
        where m.event_id = p_event_id
          and m.role = 'co_organizer'
      ) recipients
    loop
      perform public.enqueue_notification(
        v_type,
        p_event_id,
        v_rec.user_id,
        v_dedupe_time,
        jsonb_build_object(
          'kind', 'capacity_90',
          'metric', v_metric,
          'used', v_used,
          'cap', v_cap,
          'threshold', 90
        )
      );
      v_count := v_count + 1;
    end loop;
  end loop;

  return v_count;
end;
$function$;
