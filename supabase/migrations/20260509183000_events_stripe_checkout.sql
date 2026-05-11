-- Idempotent fulfillment: one Stripe Checkout Session maps to at most one event.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS events_stripe_checkout_session_id_key
  ON public.events (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
