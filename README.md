# Calisto Events Landing

## Development

Run the app locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Waitlist backend (Supabase)

The waitlist form posts to `POST /api/waitlist`, which inserts into Supabase.

Set these environment variables in `.env.local`:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Important: `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed in client code.

### Required table

Create this table in Supabase:

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_lower_unique
  on public.waitlist (lower(email));
```

## Quality checks

```bash
npm run lint
npm run build
```

