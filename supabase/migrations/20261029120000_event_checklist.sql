-- Organizer prep list for the days before the event: ticks on Calisto's own steps
-- (step = 'qr', 'share', ...) and the organizer's own items (label, step NULL).
CREATE TABLE public.event_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  step text CHECK (step IN ('invites', 'qr', 'share', 'co', 'moderation', 'peek')),
  label text CHECK (char_length(btrim(label)) BETWEEN 1 AND 200),
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_checklist_items_step_or_label CHECK ((step IS NULL) <> (label IS NULL)),
  -- NULL steps never collide, so own items are unlimited while each built-in step has one row.
  CONSTRAINT event_checklist_items_event_step_key UNIQUE (event_id, step)
);

CREATE INDEX event_checklist_items_event_idx ON public.event_checklist_items (event_id, created_at);

ALTER TABLE public.event_checklist_items ENABLE ROW LEVEL SECURITY;

-- Primary organizer and co-organizers share one list.
CREATE OR REPLACE FUNCTION public.can_manage_event_checklist(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id
      AND (
        e.organizer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.event_memberships em
          WHERE em.event_id = e.id
            AND em.user_id = auth.uid()
            AND em.role = 'co_organizer'
        )
      )
  );
$$;

CREATE POLICY event_checklist_items_select
  ON public.event_checklist_items FOR SELECT TO authenticated
  USING (public.can_manage_event_checklist(event_id));

CREATE POLICY event_checklist_items_insert
  ON public.event_checklist_items FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_event_checklist(event_id));

CREATE POLICY event_checklist_items_update
  ON public.event_checklist_items FOR UPDATE TO authenticated
  USING (public.can_manage_event_checklist(event_id))
  WITH CHECK (public.can_manage_event_checklist(event_id));

CREATE POLICY event_checklist_items_delete
  ON public.event_checklist_items FOR DELETE TO authenticated
  USING (public.can_manage_event_checklist(event_id));
