-- Details for the ZIP status page: when packing ran, which file broke it, which e-mails went out,
-- and the organizer's language so the worker can write the ready/failed e-mail in it.
ALTER TABLE public.media_zip_exports
  ADD COLUMN started_at timestamptz,
  ADD COLUMN finished_at timestamptz,
  ADD COLUMN failed_item text,
  ADD COLUMN emailed_started_at timestamptz,
  ADD COLUMN emailed_result_at timestamptz,
  ADD COLUMN locale text;
