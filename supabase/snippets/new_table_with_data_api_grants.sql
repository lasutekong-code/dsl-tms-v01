-- Template: create a table reachable via Supabase Data API (supabase-js / PostgREST)
-- See: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically

-- create table public.example (
--   id uuid primary key default gen_random_uuid(),
--   ...
-- );

-- alter table public.example enable row level security;
-- create policy ... on public.example ...;

select public.grant_data_api_access('public.example'::regclass);
