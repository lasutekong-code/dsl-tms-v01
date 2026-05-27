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

## Supabase Auth redirect URLs

For password reset emails, add your app origin in **Authentication → URL Configuration**:

- `https://<your-domain>/auth/callback`
- `https://<your-domain>/login/reset-password`

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run env:sync` — add missing keys from `.env.example` into `.env.local`
