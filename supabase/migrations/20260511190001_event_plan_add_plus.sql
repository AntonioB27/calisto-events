-- New enum label must be committed before any function/trigger references it (PG safety).
ALTER TYPE public.event_plan ADD VALUE IF NOT EXISTS 'plus' AFTER 'standard';
