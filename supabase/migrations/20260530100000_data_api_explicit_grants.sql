-- Supabase Data API: explicit grants for public schema (May/Oct 2026 rollout)
-- https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
--
-- Bundle with table creation:
--   SELECT public.grant_data_api_access('public.your_table');

-- Reusable grant helper for new tables
CREATE OR REPLACE FUNCTION public.grant_data_api_access(p_relation regclass)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_schema text;
  v_name text;
BEGIN
  v_schema := split_part(p_relation::text, '.', 1);
  v_name := split_part(p_relation::text, '.', 2);

  IF v_name = '' THEN
    v_name := v_schema;
    v_schema := 'public';
  END IF;

  EXECUTE format('GRANT SELECT ON %I.%I TO anon', v_schema, v_name);
  EXECUTE format(
    'GRANT SELECT, INSERT, UPDATE, DELETE ON %I.%I TO authenticated, service_role',
    v_schema,
    v_name
  );
END;
$$;

REVOKE ALL ON FUNCTION public.grant_data_api_access(regclass) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_data_api_access(regclass) TO postgres, service_role;

-- All existing application tables in public
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.oid::regclass AS rel
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname NOT LIKE 'pg_%'
    ORDER BY c.relname
  LOOP
    PERFORM public.grant_data_api_access(r.rel);
  END LOOP;
END;
$$;

-- Sequences (serial/identity columns via Data API)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- RLS helper used in policies
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated, service_role;

-- Future tables created by postgres in public (explicit opt-in to Data API)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
