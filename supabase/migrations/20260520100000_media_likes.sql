-- Photo likes for event gallery media (web + future mobile clients).
-- Membership predicate mirrors event_memberships + primary organizer access.

CREATE TABLE public.media_likes (
  media_item_id uuid NOT NULL REFERENCES public.media_items (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (media_item_id, user_id)
);

CREATE INDEX media_likes_media_item_idx ON public.media_likes (media_item_id);
CREATE INDEX media_likes_event_idx ON public.media_likes (event_id);

ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_likes_select_member
  ON public.media_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = media_likes.event_id
        AND (
          e.organizer_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.event_memberships em
            WHERE em.event_id = e.id
              AND em.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY media_likes_insert_member
  ON public.media_likes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.media_items mi
      WHERE mi.id = media_item_id
        AND mi.event_id = media_likes.event_id
    )
    AND EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND (
          e.organizer_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.event_memberships em
            WHERE em.event_id = e.id
              AND em.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY media_likes_delete_own
  ON public.media_likes
  FOR DELETE
  USING (user_id = auth.uid());
