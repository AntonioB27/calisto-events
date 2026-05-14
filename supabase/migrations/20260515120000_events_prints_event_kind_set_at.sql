-- First-time Prints tab: NULL until organizer confirms event type there.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS prints_event_kind_set_at timestamptz;

COMMENT ON COLUMN public.events.prints_event_kind_set_at IS 'Set when the primary organizer completes the event-type step on the Prints tab.';
