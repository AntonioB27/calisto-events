# Calisto Events Landing

## Development

Run the app locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Event media (Supabase Auth + browser client)

The organized app and guest flows use the Supabase URL and **anon** key (same as [Project Settings → API](https://supabase.com/dashboard/project/_/settings/api)). Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Without these, middleware skips session refresh and login/admin flows will not work.

### Production builds (important)

Next.js embeds `NEXT_PUBLIC_*` into the JS bundle **at build time**. If CI / Vercel / Docker runs `npm run build` **without** these variables available, guests and organizers hit `@supabase/ssr: URL and API key are required`.

- In your host’s dashboard, set **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** for Production (same values as Dashboard → Settings → API: **Project URL** and **anon public**).
- Deploy again after saving (every change needs a **new build**).

If you currently only define server-style **`SUPABASE_URL`** and **`SUPABASE_ANON_KEY`**, either add the `NEXT_PUBLIC_*` copies or rely on **`next.config.ts`**, which maps `SUPABASE_*` / `EXPO_PUBLIC_*` into the browser bundle automatically.

Optional but recommended for **correct guest join links** in emails and on the Share tab (especially behind proxies):

```bash
NEXT_PUBLIC_SITE_URL=https://calisto-events.com
```

**Password reset emails** use `resetPasswordForEmail` with `redirectTo` set to `{origin}/auth/reset-password`. In the Supabase dashboard ([Authentication → URL configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)), add that path to **Redirect URLs**, e.g. `http://localhost:3000/auth/reset-password` and your production URL with the same path.

**First-run onboarding:** Public entry points are `/welcome` (organizer vs guest) and `/join` (paste an access code). After sign-in, organizers complete a short screen at `/onboarding/organizer` until `profiles.onboarding_completed_at` is set (requires the `onboarding_completed_at` column on `profiles` from the mobile app migrations).

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

