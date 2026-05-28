-- Event kind for print template catalog and future type-specific UX (e.g. wedding).
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_kind text NOT NULL DEFAULT 'generic';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_event_kind_check'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_event_kind_check
      CHECK (event_kind IN ('generic', 'wedding'));
  END IF;
END $$;
