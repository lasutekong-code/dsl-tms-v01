# dsl-tms-v01

Fleet / vehicle management web app (Next.js + Supabase).

## Environment variables

Copy the template and fill in values on the server (or your PC for local dev):

```bash
cp .env.example .env.local
# or merge missing keys into an existing file:
npm run env:sync
```

Edit `.env.local` and set at minimum:

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → `anon` / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` (secret). Replace the placeholder `your-service-role-key` |

Example line in `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Replace `your-service-role-key` with the real **service_role** JWT from the dashboard. Never commit this file (it is listed in `.gitignore`).

`SUPABASE_SERVICE_ROLE_KEY` is required for:

- Admin account creation (`/admin/admins/new`)
- Accurate 비밀번호 찾기 / account lookup (bypasses RLS on `profiles`)

Restart the dev server after changing `.env.local`:

```bash
npm run dev
```

## Vercel (Preview / Production)

In the Vercel project, open **Settings → Environment Variables** and add the same keys for **Preview** and **Production** (not only Production):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (admin features, password reset lookup)
- `FIELD_ENCRYPTION_KEY` (PII encryption; use the same value as local)

After saving, **redeploy** the Preview deployment (or push a new commit). Without these variables, the app shows the login screen with a configuration message instead of a blank error page.

In **Supabase → Authentication → URL Configuration**, add redirect URLs for each Vercel host, for example:

- `https://<your-preview>.vercel.app/auth/callback`
- `https://<your-preview>.vercel.app/login/reset-password`
- `https://<your-production-domain>/auth/callback`

## Supabase Auth redirect URLs

For password reset emails, add your app origin in **Authentication → URL Configuration**:

- `https://<your-domain>/auth/callback`
- `https://<your-domain>/login/reset-password`

## Database migrations

SQL migrations live in `supabase/migrations/`. New tables must include explicit **Data API** grants — see [supabase/README.md](./supabase/README.md).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run env:sync` — add missing keys from `.env.example` into `.env.local`
