-- Atomically claim the next queued ZIP export job for the service-role worker.

CREATE OR REPLACE FUNCTION public.claim_next_zip_export_job()
RETURNS public.media_zip_exports
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  picked_id uuid;
  r public.media_zip_exports;
BEGIN
  SELECT m.id
  INTO picked_id
  FROM public.media_zip_exports m
  WHERE m.status = 'queued'
  ORDER BY m.created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF picked_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.media_zip_exports m
  SET status = 'running', updated_at = now()
  WHERE m.id = picked_id
  RETURNING * INTO STRICT r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_next_zip_export_job() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_next_zip_export_job() TO service_role;

CREATE INDEX media_zip_exports_ready_expires_idx
  ON public.media_zip_exports (expires_at)
  WHERE status = 'ready';
