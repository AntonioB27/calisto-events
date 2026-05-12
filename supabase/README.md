# Supabase migrations

SQL in `migrations/` defines RPCs and schema changes referenced by this app (for example membership `leave_event`, `delete_event_as_primary_return_paths`, **`scheduled_deletion_at` + `delete_event_system_return_paths`** for plan-based auto deletion).

Apply migrations **in order** (`20260511190001` adds enum `plus` in its own migration so `20260511190002` can reference it in the same database).

Apply them to your Supabase project with:

- **Supabase CLI:** `supabase db push` (from a linked project), or
- **Dashboard:** paste each file into **SQL Editor** and run.

The Next.js API route `POST /api/events/[id]/delete` also needs **`SUPABASE_SERVICE_ROLE_KEY`** in server environment so bucket objects can be removed after the DB teardown RPC returns paths.
