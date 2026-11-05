-- One RSVP per browser token per event. Without this, two concurrent first submits from the
-- same guest create two rows and later `.maybeSingle()` lookups by token fail, locking the
-- guest out of editing. The submit route treats a 23505 on insert as "update instead".
DROP INDEX IF EXISTS public.rsvps_event_client_token_idx;
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_event_client_token_key ON public.rsvps (event_id, client_token);
