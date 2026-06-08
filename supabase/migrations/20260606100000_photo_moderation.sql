-- Add moderation columns to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS moderation_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS organizer_gallery_reviewed_at timestamptz;

-- Add moderation_status to media_items
ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'visible';

ALTER TABLE public.media_items
  ADD CONSTRAINT media_items_moderation_status_check
  CHECK (moderation_status IN ('visible', 'pending', 'approved'));

-- Replace the media_items SELECT policy to respect moderation_status.
-- Drop any existing member-select policy by common names (safe if not present).
DROP POLICY IF EXISTS media_items_select ON public.media_items;
DROP POLICY IF EXISTS media_items_select_member ON public.media_items;
DROP POLICY IF EXISTS media_items_select_event_member ON public.media_items;

-- Members see visible/approved + their own pending. Organizer sees everything.
CREATE POLICY media_items_select_with_moderation
ON public.media_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.event_memberships em
    WHERE em.event_id = media_items.event_id
      AND em.user_id = auth.uid()
  )
  AND (
    -- Organizer of this event always sees all
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = media_items.event_id
        AND e.organizer_id = auth.uid()
    )
    OR media_items.moderation_status IN ('visible', 'approved')
    OR media_items.uploaded_by = auth.uid()
  )
);
