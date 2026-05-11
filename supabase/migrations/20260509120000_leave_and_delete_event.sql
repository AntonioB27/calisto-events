-- Self-service membership leave (not for primary organizer).
CREATE OR REPLACE FUNCTION public.leave_event(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  deleted_ct int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  IF EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event_id AND e.organizer_id = v_uid) THEN
    RAISE EXCEPTION 'PRIMARY_ORGANIZER_CANNOT_LEAVE';
  END IF;

  DELETE FROM public.event_memberships m
  WHERE m.event_id = p_event_id AND m.user_id = v_uid;

  GET DIAGNOSTICS deleted_ct = ROW_COUNT;
  IF deleted_ct = 0 THEN
    RAISE EXCEPTION 'NOT_A_MEMBER';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.leave_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leave_event(uuid) TO authenticated;

-- Primary-organizer teardown: deletes DB rows for the event; returns storage paths for app-layer bucket cleanup.
CREATE OR REPLACE FUNCTION public.delete_event_as_primary_return_paths(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  path_list jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event_id AND e.organizer_id = v_uid) THEN
    RAISE EXCEPTION 'NOT_ORGANIZER';
  END IF;

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

REVOKE ALL ON FUNCTION public.delete_event_as_primary_return_paths(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_event_as_primary_return_paths(uuid) TO authenticated;
