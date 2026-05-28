ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS thumbnail_path text;

-- Fix organizer-triggered delete: return both storage_path and thumbnail_path.
CREATE OR REPLACE FUNCTION public.delete_event_as_primary_return_paths(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  path_list jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id AND e.organizer_id = v_uid
  ) THEN
    RAISE EXCEPTION 'NOT_ORGANIZER';
  END IF;

  SELECT coalesce(jsonb_agg(p) FILTER (WHERE p IS NOT NULL AND p <> ''), '[]'::jsonb)
  INTO path_list
  FROM (
    SELECT m.storage_path   AS p FROM public.media_items m WHERE m.event_id = p_event_id
    UNION ALL
    SELECT m.thumbnail_path AS p FROM public.media_items m
      WHERE m.event_id = p_event_id AND m.thumbnail_path IS NOT NULL
  ) paths;

  DELETE FROM public.media_items     WHERE event_id = p_event_id;
  DELETE FROM public.event_memberships WHERE event_id = p_event_id;
  DELETE FROM public.events           WHERE id        = p_event_id;

  RETURN path_list;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_event_as_primary_return_paths(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_event_as_primary_return_paths(uuid) TO authenticated;

-- Fix system-triggered scheduled delete: return both paths.
CREATE OR REPLACE FUNCTION public.delete_event_system_return_paths(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  path_list jsonb;
BEGIN
  SELECT coalesce(jsonb_agg(p) FILTER (WHERE p IS NOT NULL AND p <> ''), '[]'::jsonb)
  INTO path_list
  FROM (
    SELECT m.storage_path   AS p FROM public.media_items m WHERE m.event_id = p_event_id
    UNION ALL
    SELECT m.thumbnail_path AS p FROM public.media_items m
      WHERE m.event_id = p_event_id AND m.thumbnail_path IS NOT NULL
  ) paths;

  DELETE FROM public.media_items     WHERE event_id = p_event_id;
  DELETE FROM public.event_memberships WHERE event_id = p_event_id;
  DELETE FROM public.events           WHERE id        = p_event_id;

  RETURN path_list;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_event_system_return_paths(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_event_system_return_paths(uuid) TO service_role;
