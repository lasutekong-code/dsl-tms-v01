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

Official pattern (equivalent to the helper):

```sql
GRANT SELECT ON public.your_table TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO authenticated, service_role;
```

RLS still controls which rows each role can see; grants only allow the role to attempt the operation.

### References

- [Changelog: Tables not exposed to Data API automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
