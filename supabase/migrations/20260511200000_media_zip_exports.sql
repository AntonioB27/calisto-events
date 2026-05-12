CREATE TYPE public.media_zip_export_status AS ENUM ('queued', 'running', 'ready', 'failed', 'expired');

CREATE TABLE public.media_zip_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  include_videos boolean NOT NULL DEFAULT false,
  status public.media_zip_export_status NOT NULL DEFAULT 'queued',
  storage_path text,
  file_size_bytes bigint,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX media_zip_exports_event_created_idx
  ON public.media_zip_exports (event_id, created_at DESC);

CREATE INDEX media_zip_exports_status_created_idx
  ON public.media_zip_exports (status, created_at);

CREATE OR REPLACE FUNCTION public.media_zip_exports_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER media_zip_exports_set_updated_at
  BEFORE UPDATE ON public.media_zip_exports
  FOR EACH ROW
  EXECUTE FUNCTION public.media_zip_exports_set_updated_at();

ALTER TABLE public.media_zip_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_zip_exports_select_primary
  ON public.media_zip_exports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = media_zip_exports.event_id
        AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY media_zip_exports_insert_primary
  ON public.media_zip_exports
  FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = media_zip_exports.event_id
        AND e.organizer_id = auth.uid()
    )
  );

-- No UPDATE/DELETE policies for authenticated; worker uses service_role.
