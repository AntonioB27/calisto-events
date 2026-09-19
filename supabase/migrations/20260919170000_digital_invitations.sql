-- A published invitation is an immutable-at-send snapshot. Households and
-- attendees intentionally do not use event_memberships: guests can RSVP
-- without creating a Calisto account.
CREATE TABLE public.event_digital_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL UNIQUE REFERENCES public.events (id) ON DELETE CASCADE,
  published_fields jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  response_deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.digital_invitation_households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_invitation_id uuid NOT NULL REFERENCES public.event_digital_invitations (id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 120),
  public_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  max_attendees integer NOT NULL DEFAULT 1 CHECK (max_attendees BETWEEN 1 AND 20),
  response_status text NOT NULL DEFAULT 'pending' CHECK (response_status IN ('pending', 'attending', 'declined')),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.digital_invitation_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.digital_invitation_households (id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, name)
);

CREATE INDEX digital_invitation_households_invitation_idx
  ON public.digital_invitation_households (digital_invitation_id);
CREATE INDEX digital_invitation_attendees_household_idx
  ON public.digital_invitation_attendees (household_id);

CREATE OR REPLACE FUNCTION public.digital_invitations_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_digital_invitations_set_updated_at
  BEFORE UPDATE ON public.event_digital_invitations
  FOR EACH ROW EXECUTE FUNCTION public.digital_invitations_set_updated_at();
CREATE TRIGGER digital_invitation_households_set_updated_at
  BEFORE UPDATE ON public.digital_invitation_households
  FOR EACH ROW EXECUTE FUNCTION public.digital_invitations_set_updated_at();

ALTER TABLE public.event_digital_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_invitation_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_invitation_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_digital_invitations_primary_access
  ON public.event_digital_invitations
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));

CREATE POLICY digital_invitation_households_primary_access
  ON public.digital_invitation_households
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.event_digital_invitations di
    JOIN public.events e ON e.id = di.event_id
    WHERE di.id = digital_invitation_id AND e.organizer_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.event_digital_invitations di
    JOIN public.events e ON e.id = di.event_id
    WHERE di.id = digital_invitation_id AND e.organizer_id = auth.uid()
  ));

CREATE POLICY digital_invitation_attendees_primary_access
  ON public.digital_invitation_attendees
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.digital_invitation_households h
    JOIN public.event_digital_invitations di ON di.id = h.digital_invitation_id
    JOIN public.events e ON e.id = di.event_id
    WHERE h.id = household_id AND e.organizer_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.digital_invitation_households h
    JOIN public.event_digital_invitations di ON di.id = h.digital_invitation_id
    JOIN public.events e ON e.id = di.event_id
    WHERE h.id = household_id AND e.organizer_id = auth.uid()
  ));

-- Public RPCs only expose the published artwork and the recipient's own RSVP.
CREATE OR REPLACE FUNCTION public.get_digital_invitation(p_token uuid)
RETURNS TABLE (
  event_id uuid,
  event_title text,
  event_date timestamptz,
  household_label text,
  max_attendees integer,
  response_status text,
  responded_at timestamptz,
  response_deadline timestamptz,
  published_fields jsonb,
  attendee_names text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    e.id,
    e.title,
    e.event_date,
    h.label,
    h.max_attendees,
    h.response_status,
    h.responded_at,
    di.response_deadline,
    di.published_fields,
    COALESCE(array_agg(a.name ORDER BY a.created_at) FILTER (WHERE a.id IS NOT NULL), '{}'::text[])
  FROM public.digital_invitation_households h
  JOIN public.event_digital_invitations di ON di.id = h.digital_invitation_id
  JOIN public.events e ON e.id = di.event_id
  LEFT JOIN public.digital_invitation_attendees a ON a.household_id = h.id
  WHERE h.public_token = p_token
  GROUP BY e.id, e.title, e.event_date, h.id, di.id;
$$;

CREATE OR REPLACE FUNCTION public.submit_digital_invitation_rsvp(
  p_token uuid,
  p_status text,
  p_attendee_names text[]
)
RETURNS TABLE (response_status text, attendee_names text[], responded_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_household_id uuid;
  v_max_attendees integer;
  v_deadline timestamptz;
  v_names text[];
  v_responded_at timestamptz := now();
BEGIN
  SELECT h.id, h.max_attendees, di.response_deadline
  INTO v_household_id, v_max_attendees, v_deadline
  FROM public.digital_invitation_households h
  JOIN public.event_digital_invitations di ON di.id = h.digital_invitation_id
  WHERE h.public_token = p_token
  FOR UPDATE OF h;

  IF v_household_id IS NULL THEN RAISE EXCEPTION 'INVITATION_NOT_FOUND'; END IF;
  IF v_deadline IS NOT NULL AND v_responded_at > v_deadline THEN RAISE EXCEPTION 'RSVP_CLOSED'; END IF;
  IF p_status NOT IN ('attending', 'declined') THEN RAISE EXCEPTION 'INVALID_RESPONSE'; END IF;

  SELECT COALESCE(array_agg(name), '{}'::text[])
  INTO v_names
  FROM (
    SELECT btrim(value) AS name
    FROM unnest(COALESCE(p_attendee_names, '{}'::text[])) AS value
    WHERE btrim(value) <> ''
  ) cleaned;

  IF p_status = 'declined' THEN v_names := '{}'::text[]; END IF;
  IF p_status = 'attending' AND cardinality(v_names) = 0 THEN RAISE EXCEPTION 'ATTENDEE_REQUIRED'; END IF;
  IF cardinality(v_names) > v_max_attendees THEN RAISE EXCEPTION 'TOO_MANY_ATTENDEES'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(v_names) AS name WHERE char_length(name) > 120) THEN RAISE EXCEPTION 'INVALID_ATTENDEE'; END IF;
  IF (SELECT count(*) FROM (SELECT lower(name) FROM unnest(v_names) AS name GROUP BY lower(name) HAVING count(*) > 1) duplicates) > 0 THEN RAISE EXCEPTION 'DUPLICATE_ATTENDEE'; END IF;

  DELETE FROM public.digital_invitation_attendees WHERE household_id = v_household_id;
  INSERT INTO public.digital_invitation_attendees (household_id, name)
  SELECT v_household_id, name FROM unnest(v_names) AS name;

  UPDATE public.digital_invitation_households
  SET response_status = p_status, responded_at = v_responded_at
  WHERE id = v_household_id;

  RETURN QUERY SELECT p_status, v_names, v_responded_at;
END;
$$;

REVOKE ALL ON FUNCTION public.get_digital_invitation(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_digital_invitation_rsvp(uuid, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_digital_invitation(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_digital_invitation_rsvp(uuid, text, text[]) TO anon, authenticated;
