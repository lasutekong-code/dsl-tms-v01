# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

DSL TMS is a Korean-language fleet/vehicle management web app built with **Next.js 16 (App Router) + Supabase + Tailwind CSS 4 + shadcn/ui**. It is a single Next.js project (not a monorepo).

### Environment variables

Copy `.env.example` → `.env.local` and fill in the three required Supabase keys (see `README.md` for details). The `.env.local` file is gitignored.

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, needed for admin features)
- `VEHICLE_DETAIL_USE_MOCK=true` — enables mock data for the vehicle detail page without Supabase

### Common commands

All commands are defined in `package.json`:

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests | `npm test` |
| Build | `npm run build` |
| Sync env keys | `npm run env:sync` |

### Gotchas

- The project uses **npm** (lockfile is `package-lock.json`). Do not use pnpm or yarn.
- There is no middleware file (`middleware.ts`). Auth checks happen in individual page/route handlers.
- The `main` branch is nearly empty (initial commit only). All application code lives on feature branches; the most complete branch is `cursor/admin-registration-screens-bf21`.
- The `npm run typecheck` script calls `next typegen` first (generates Supabase types), which requires the dev server or a build to have run at least once so `.next/` exists.
- Admin accounts cannot be created via the public signup flow. Use `node scripts/create-admin.mjs` (requires `SUPABASE_SERVICE_ROLE_KEY`).
- After changing `.env.local`, restart the dev server for changes to take effect.
