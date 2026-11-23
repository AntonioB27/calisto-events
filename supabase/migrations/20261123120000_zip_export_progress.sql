-- Live progress for the gallery ZIP dock: the worker writes how many media files are packed so far.
ALTER TABLE public.media_zip_exports
  ADD COLUMN progress_done integer NOT NULL DEFAULT 0,
  ADD COLUMN progress_total integer;
