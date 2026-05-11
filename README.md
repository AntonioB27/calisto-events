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

Without these, [`middleware.ts`](./middleware.ts) skips session refresh and login/admin flows will not work as expected.

### Production builds (important)

Next.js embeds `NEXT_PUBLIC_*` into the JS bundle **at build time**. If CI / Vercel / Docker runs `npm run build` **without** these variables available, guests and organizers hit `@supabase/ssr: URL and API key are required`.

- In your host’s dashboard, set `**NEXT_PUBLIC_SUPABASE_URL`** and `**NEXT_PUBLIC_SUPABASE_ANON_KEY**` for Production (same values as Dashboard → Settings → API: **Project URL** and **anon public**).
- Deploy again after saving (every change needs a **new build**).

If you currently only define server-style `**SUPABASE_URL`** and `**SUPABASE_ANON_KEY**`, either add the `NEXT_PUBLIC_*` copies or rely on `**next.config.ts**`, which maps `SUPABASE_*` / `EXPO_PUBLIC_*` into the browser bundle automatically.

Optional but recommended for **correct guest join links** in emails and on the Share tab (especially behind proxies):

```bash
NEXT_PUBLIC_SITE_URL=https://calisto-events.com
```

**Password reset emails** use `resetPasswordForEmail` with `redirectTo` set to `{origin}/auth/reset-password`. In the Supabase dashboard ([Authentication → URL configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)), add that path to **Redirect URLs**, e.g. `http://localhost:3000/auth/reset-password` and your production URL with the same path.

**Google sign-in** uses Supabase OAuth and returns through `/auth/callback`. Add `{origin}/auth/callback` (dev and prod) to **Redirect URLs**, and enable **Google** under Authentication → Providers (client ID and secret from [Google Cloud Console](https://console.cloud.google.com/)).

**Guest “continue without account”** uses Supabase **`signInAnonymously()`**. Enable **anonymous sign-ins** under Authentication → Providers so the guest join flow works.

**First-run onboarding:** Public entry points are `/welcome` (organizer vs guest) and `/join` (paste an access code). After sign-in, organizers complete a short screen at `/onboarding/organizer` until `profiles.onboarding_completed_at` is set (requires the `onboarding_completed_at` column on `profiles` from the mobile app migrations).

### API rate limiting (built-in)

`POST /api/waitlist` and `GET /api/join/preview` apply light **per-IP**, **per-server-instance** limits in process memory. Scale-out or rotating instances reset windows independently. For stricter protection, configure your host’s **edge firewall**, **WAF**, or a shared rate-limit store (e.g. Redis) in addition to these defaults.

### Privacy and terms

Public copies live at **`/privacy`** and **`/terms`** (redirect to the default locale path) and at **`/[locale]/privacy`** and **`/[locale]/terms`**. Replace the boilerplate legal text with counsel-reviewed wording before relying on it.

## Paid events (Stripe)

Checkout and webhooks use the server-side Stripe key and a signing secret:

```bash
STRIPE_SECRET_KEY=sk_live_...   # or sk_test_... in sandbox
STRIPE_WEBHOOK_SECRET=whsec_...
```

- **Webhook URL:** `POST {your-origin}/api/stripe/webhook` — listen for **`checkout.session.completed`**.
- **`NEXT_PUBLIC_APP_URL`:** Canonical site URL with protocol (e.g. `https://calisto-events.com`). Used when building Checkout success/cancel URLs so redirects match your custom domain. If unset on Vercel, the app falls back to `https://${VERCEL_URL}`.

After changing environment variables related to Stripe or Supabase **`NEXT_PUBLIC_*` keys**, redeploy so a fresh build picks them up.

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

