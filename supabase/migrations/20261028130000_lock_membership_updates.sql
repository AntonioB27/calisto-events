-- A member could previously update every column of their own membership row (the RLS policy
-- memberships_update_own_display_name only checks user_id = auth.uid()), so a guest could make
-- themselves co_organizer or move the row onto another event. Members may now only rename
-- themselves; role / event / user changes go through the security-definer RPCs
-- (join_event_with_code, leave_event, remove_event_member, set_member_co_organizer_status).

revoke update on table public.event_memberships from anon, authenticated;
revoke update (id, event_id, user_id, role, joined_at, display_name_at_event)
  on table public.event_memberships from anon, authenticated;

grant update (display_name_at_event) on table public.event_memberships to authenticated;
