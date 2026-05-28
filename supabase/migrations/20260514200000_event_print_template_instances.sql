-- Per-event print template drafts and paid entitlements (one row per event + template).
CREATE TABLE public.event_print_template_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  template_id text NOT NULL,
  field_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  stripe_checkout_session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_print_template_instances_event_template_key UNIQUE (event_id, template_id)
);

CREATE UNIQUE INDEX event_print_template_instances_stripe_checkout_session_id_key
  ON public.event_print_template_instances (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX event_print_template_instances_event_id_idx
  ON public.event_print_template_instances (event_id);

CREATE OR REPLACE FUNCTION public.event_print_template_instances_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_print_template_instances_set_updated_at
  BEFORE UPDATE ON public.event_print_template_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.event_print_template_instances_set_updated_at();

ALTER TABLE public.event_print_template_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_print_template_instances_select_primary
  ON public.event_print_template_instances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_print_template_instances.event_id
        AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY event_print_template_instances_insert_primary
  ON public.event_print_template_instances
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_print_template_instances.event_id
        AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY event_print_template_instances_update_primary
  ON public.event_print_template_instances
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_print_template_instances.event_id
        AND e.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_print_template_instances.event_id
        AND e.organizer_id = auth.uid()
    )
  );
