-- RSVP: anonymous, shared-link attendance confirmation, independent of guest media access.
-- See CONTEXT.md and docs/adr/0001-anonymous-cookie-identified-rsvp.md for the domain model.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS rsvp_code text,
  ADD COLUMN IF NOT EXISTS rsvp_open boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS events_rsvp_code_key ON public.events (rsvp_code) WHERE rsvp_code IS NOT NULL;

CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('confirmed', 'declined')),
  submitter_name text NOT NULL,
  contact text,
  -- Only populated for status = 'confirmed'. Each element: { name: text, type: 'adult' | 'child' }.
  attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
  client_token text NOT NULL,
  possible_duplicate_of uuid REFERENCES public.rsvps (id) ON DELETE SET NULL,
  duplicate_status text CHECK (duplicate_status IN ('flagged', 'dismissed', 'merged')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rsvps_event_idx ON public.rsvps (event_id);
CREATE INDEX rsvps_event_client_token_idx ON public.rsvps (event_id, client_token);

-- No anonymous/authenticated policies for direct client writes or reads: all guest-facing
-- access goes through server routes using the service-role key (see lib/supabase-server.ts),
-- matching the anonymous, account-free access model for RSVP (docs/adr/0001).
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY rsvps_select_organizer
  ON public.rsvps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = rsvps.event_id
        AND (
          e.organizer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.event_memberships em
            WHERE em.event_id = e.id
              AND em.user_id = auth.uid()
              AND em.role = 'co_organizer'
          )
        )
    )
  );

CREATE POLICY rsvps_update_organizer
  ON public.rsvps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = rsvps.event_id AND e.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = rsvps.event_id AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY rsvps_delete_organizer
  ON public.rsvps
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = rsvps.event_id AND e.organizer_id = auth.uid()
    )
  );
