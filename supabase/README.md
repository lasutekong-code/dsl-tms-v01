# Supabase migrations

## Data API grants (May–Oct 2026)

Supabase no longer exposes new `public` tables to the Data API (PostgREST / `supabase-js`) unless you grant access explicitly.

This repo includes:

| File | Purpose |
|------|---------|
| `migrations/20260530100000_data_api_explicit_grants.sql` | Grants all current `public` tables + default privileges for future tables |
| `snippets/new_table_with_data_api_grants.sql` | Copy-paste template for new tables |

### New table checklist

1. `CREATE TABLE public.your_table (...)`
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
3. `CREATE POLICY ...` (row access rules)
4. `SELECT public.grant_data_api_access('public.your_table'::regclass);`

### Views

App-facing views should use **security invoker** so RLS applies as the caller (not the view owner):

```sql
CREATE VIEW public.my_view
WITH (security_invoker = true)
AS SELECT ...;
```

Or for an existing view: `ALTER VIEW public.my_view SET (security_invoker = true);`

Official pattern (equivalent to the helper):

```sql
GRANT SELECT ON public.your_table TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO authenticated, service_role;
```

RLS still controls which rows each role can see; grants only allow the role to attempt the operation.

### References

- [Changelog: Tables not exposed to Data API automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Security Advisor

Migrations under `supabase/migrations/` address common lints:

| Lint | Fix |
|------|-----|
| `function_search_path_mutable` | `SET search_path = public` on functions |
| `*_security_definer_function_executable` | `REVOKE EXECUTE` from `anon` / `authenticated` on internal RPCs (`is_active_admin`, `handle_new_user`, `grant_data_api_access`) |
| `rls_policy_always_true` | Replace `WITH CHECK (true)` with field constraints (see `account_requests`) |
| `extension_in_public` | `pg_trgm` lives in `extensions` schema; GIN indexes use `extensions.gin_trgm_ops` |

**Leaked password protection** (Auth dashboard only): Authentication → Providers → Email → enable [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
